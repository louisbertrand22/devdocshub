from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List, Optional
from app.models.note import Note, get_my_notes, get_count_my_notes, get_note_by_id, get_notes_by_doc, insert_note, delete_note, update_note
from app.utils.auth_dep import require_roles
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut
from uuid import UUID

router = APIRouter()

# Les notes sont privées : l'auteur vient toujours du token, jamais d'un paramètre client.
current_user = require_roles("user", "maintainer", "admin")

@router.get("/count", response_model=int)
async def count_notes(user: dict = Depends(current_user)):
    return get_count_my_notes(user["id"])

@router.get("/count/mine", response_model=int)
async def count_my_notes(uuid: Optional[UUID] = None, user: dict = Depends(current_user)):
    # `uuid` est accepté pour compatibilité mais ignoré.
    return get_count_my_notes(user["id"])

def serialize(note: Note) -> NoteOut:
    return NoteOut(
        id=str(note.id),
        doc_id=str(note.doc_id),
        user_id=str(note.user_id),
        content=note.content,
        created_at=note.created_at.isoformat() if note.created_at else None,
        updated_at=note.updated_at.isoformat() if note.updated_at else None,
        is_pinned=note.is_pinned
    )

@router.get("", response_model=List[NoteOut])
async def list_notes(user: dict = Depends(current_user)):
    return [serialize(note) for note in get_my_notes(user["id"])]

@router.get("/mine", response_model=List[NoteOut])
async def list_my_notes(uuid: Optional[UUID] = None, user: dict = Depends(current_user)):
    # `uuid` est accepté pour compatibilité mais ignoré.
    return [serialize(note) for note in get_my_notes(user["id"])]

@router.post("", response_model=NoteOut)
async def add_note(note: NoteCreate, user: dict = Depends(current_user)):
    new_note = insert_note(
        doc_id=note.doc_id,
        user_id=user["id"],
        content=note.content,
        is_pinned=note.is_pinned
    )
    return serialize(new_note)

@router.get("/doc/{doc_id:uuid}/notes", response_model=List[NoteOut])
async def list_notes_by_doc(doc_id: UUID, user: dict = Depends(current_user)):
    return [serialize(note) for note in get_notes_by_doc(doc_id, user["id"])]

@router.delete("/{note_id:uuid}", status_code=204)
async def remove_note(note_id: UUID, user_id: Optional[UUID] = None, user: dict = Depends(current_user)):
    if not delete_note(note_id, user["id"]):
        raise HTTPException(status_code=404, detail="Note introuvable")
    return Response(status_code=204)

@router.put("/{note_id:uuid}", response_model=NoteOut)
async def modify_note(note_id: UUID, body: NoteUpdate, user: dict = Depends(current_user)):
    updated_note = update_note(note_id, user["id"], body.content, is_pinned=body.is_pinned)
    if not updated_note:
        raise HTTPException(status_code=404, detail="Note introuvable")
    return serialize(updated_note)

@router.get("/{note_id:uuid}", response_model=NoteOut)
async def get_note(note_id: UUID, user: dict = Depends(current_user)):
    note = get_note_by_id(note_id)
    if not note or note.user_id != user["id"]:
        raise HTTPException(status_code=404, detail="Note introuvable")
    return serialize(note)
