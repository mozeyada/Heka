"""Tests for field-level encryption at rest (Heka Trust Audit, Exhibit A)."""

from app.core import crypto


def test_encrypt_then_decrypt_roundtrips():
    plaintext = "He said something that really hurt me during the argument."
    ciphertext = crypto.encrypt_text(plaintext)

    assert ciphertext != plaintext
    assert ciphertext.startswith(crypto._ENCRYPTED_PREFIX)
    assert crypto.decrypt_text(ciphertext) == plaintext


def test_decrypt_passes_through_legacy_plaintext():
    """Documents written before encryption was added have no version prefix
    and must still be readable during rollout instead of raising."""
    legacy_plaintext = "An old perspective saved before encryption existed."
    assert crypto.decrypt_text(legacy_plaintext) == legacy_plaintext


def test_encrypt_and_decrypt_none_passthrough():
    assert crypto.encrypt_text(None) is None
    assert crypto.decrypt_text(None) is None
