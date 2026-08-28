"""Regression test for the couple_id ObjectId/string type-mismatch bug.

See the Heka Trust Audit, Exhibit C: commit 5756245 patched the read path
(app/api/users.py) after discovering couple_id/user_id were stored
inconsistently as strings in some documents and ObjectIds in others. The
likely write-path origin — accept_invitation storing couple_id as a bare
string — is fixed here; this test locks it so it can't silently regress.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.api.couples import accept_invitation
from app.models.invitation import InvitationStatus
from app.models.user import UserInDB


@pytest.mark.asyncio
async def test_accept_invitation_stores_couple_id_as_objectid():
    inviter_oid = ObjectId()
    invitee_id = str(ObjectId())
    invitation_oid = ObjectId()

    invitation_doc = {
        "_id": invitation_oid,
        "inviter_id": inviter_oid,
        "invitee_email": "partner@example.com",
        "token": "sometoken",
        "status": InvitationStatus.PENDING.value,
        "couple_id": None,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7),
        "accepted_at": None,
    }

    current_user = UserInDB(
        id=invitee_id,
        email="partner@example.com",
        password_hash="x",
        name="Partner",
        age=30,
    )

    db = MagicMock()
    db.invitations.find_one = AsyncMock(return_value=invitation_doc)
    db.users.find_one = AsyncMock(return_value={"_id": inviter_oid})
    db.couples.find_one = AsyncMock(return_value=None)
    db.couples.insert_one = AsyncMock(return_value=MagicMock(inserted_id=ObjectId()))
    db.invitations.update_one = AsyncMock(return_value=None)

    await accept_invitation(token="sometoken", current_user=current_user, db=db)

    update_call_args = db.invitations.update_one.call_args.args
    update_doc = update_call_args[1]
    stored_couple_id = update_doc["$set"]["couple_id"]

    assert isinstance(stored_couple_id, ObjectId), (
        f"couple_id must be stored as ObjectId, got {type(stored_couple_id)!r}: {stored_couple_id!r}"
    )
