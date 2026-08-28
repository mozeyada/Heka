"""Tests that Perspective content is actually encrypted at rest (Heka Trust Audit, Exhibit A)."""

from app.core.crypto import _ENCRYPTED_PREFIX
from app.models.perspective import PerspectiveInDB


def test_to_mongo_encrypts_content():
    perspective = PerspectiveInDB(
        argument_id="507f1f77bcf86cd799439011",
        user_id="507f1f77bcf86cd799439012",
        content="This is what actually happened between us.",
    )

    doc = perspective.to_mongo()

    assert doc["content"] != "This is what actually happened between us."
    assert doc["content"].startswith(_ENCRYPTED_PREFIX)


def test_from_mongo_decrypts_content_written_by_to_mongo():
    perspective = PerspectiveInDB(
        argument_id="507f1f77bcf86cd799439011",
        user_id="507f1f77bcf86cd799439012",
        content="This is what actually happened between us.",
    )
    doc = perspective.to_mongo()
    doc["_id"] = "irrelevant-for-this-test"

    loaded = PerspectiveInDB.from_mongo(doc)

    assert loaded.content == "This is what actually happened between us."


def test_from_mongo_reads_legacy_plaintext_document():
    """A perspective written before this fix has no encrypted prefix at all
    and must still load correctly instead of raising."""
    legacy_doc = {
        "_id": "irrelevant-for-this-test",
        "argument_id": "507f1f77bcf86cd799439011",
        "user_id": "507f1f77bcf86cd799439012",
        "content": "An old perspective saved before encryption existed.",
    }

    loaded = PerspectiveInDB.from_mongo(legacy_doc)

    assert loaded.content == "An old perspective saved before encryption existed."
