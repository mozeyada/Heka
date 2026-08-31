"""Field-level encryption for sensitive content at rest.

Uses Fernet (AES-128-CBC + HMAC-SHA256, authenticated encryption) to encrypt
free-text argument/perspective content before it reaches MongoDB, and
decrypt it on the way back out.

This is real encryption at rest. It is deliberately NOT end-to-end
encryption: the server holds the key, because the AI mediator has to read
plaintext to do its job. Marketing and product copy must describe this
accurately ("encrypted at rest") and must never claim end-to-end encryption
or that content is unreadable "even in a breach" of the application server
itself — see the Heka Trust Audit, Exhibit A.
"""

import logging
from typing import Any, Optional

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings

logger = logging.getLogger(__name__)

# Values encrypted by this module are tagged with a version prefix so that
# (a) legacy plaintext documents written before this fix can still be read
#     without raising, and (b) a future key/algorithm rotation has a marker
#     to distinguish old and new ciphertext.
_ENCRYPTED_PREFIX = "enc:v1:"

_fernet: Optional[Fernet] = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is not None:
        return _fernet

    key = settings.FIELD_ENCRYPTION_KEY
    if not key:
        raise RuntimeError(
            "FIELD_ENCRYPTION_KEY is not configured. Generate one with:\n"
            '  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"\n'
            "and set it in the environment before storing or reading sensitive content."
        )
    _fernet = Fernet(key.encode("utf-8") if isinstance(key, str) else key)
    return _fernet


def encrypt_text(plaintext: Optional[str]) -> Optional[str]:
    """Encrypt a string for storage. Returns a versioned, base64 token."""
    if plaintext is None:
        return None
    token = _get_fernet().encrypt(plaintext.encode("utf-8"))
    return _ENCRYPTED_PREFIX + token.decode("utf-8")


def decrypt_text(value: Optional[str]) -> Optional[str]:
    """Decrypt a value previously produced by encrypt_text.

    Values that don't carry the encrypted-field prefix are returned
    unchanged, so documents written before this fix (plaintext) keep working
    during rollout instead of raising. They get encrypted the next time
    they're saved.
    """
    if value is None or not isinstance(value, str) or not value.startswith(_ENCRYPTED_PREFIX):
        return value
    token = value[len(_ENCRYPTED_PREFIX):].encode("utf-8")
    try:
        return _get_fernet().decrypt(token).decode("utf-8")
    except InvalidToken:
        logger.error("Failed to decrypt stored field — wrong FIELD_ENCRYPTION_KEY or corrupted ciphertext")
        raise


def encrypt_nested_strings(value: Any) -> Any:
    """Encrypt free-text values in a JSON-like structure without changing its shape."""
    if isinstance(value, str):
        return encrypt_text(value)
    if isinstance(value, dict):
        return {key: encrypt_nested_strings(item) for key, item in value.items()}
    if isinstance(value, list):
        return [encrypt_nested_strings(item) for item in value]
    return value


def decrypt_nested_strings(value: Any) -> Any:
    """Decrypt values encrypted by :func:`encrypt_nested_strings`."""
    if isinstance(value, str):
        return decrypt_text(value)
    if isinstance(value, dict):
        return {key: decrypt_nested_strings(item) for key, item in value.items()}
    if isinstance(value, list):
        return [decrypt_nested_strings(item) for item in value]
    return value
