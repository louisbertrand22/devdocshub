from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.models.note import Note, get_my_notes, get_count_notes, get_all_notes, get_note_by_id, get_notes_by_doc, insert_note, delete_note, update_note
from app.utils.auth_dep import require_roles
from fastapi import Depends
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut
from uuid import UUID

router = APIRouter()

@router.get("/count", response_model=int, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def count_notes():
    return get_count_notes()

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

@router.get("", response_model=List[NoteOut], dependencies=[Depends(require_roles("maintainer", "admin", "user"))])
async def list_notes():
    notes = get_all_notes()
    return [serialize(note) for note in notes]

@router.get("/mine", response_model=List[NoteOut], dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def list_my_notes(uuid: UUID):
    # frontend calls /notes/mine?uuid=<user-uuid>
    notes = get_my_notes(uuid)
    return [serialize(note) for note in notes]

@router.post("", response_model=NoteOut, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def add_note(note: NoteCreate):
    new_note = insert_note(
        doc_id=note.doc_id,
        user_id=note.user_id,
        content=note.content,
        is_pinned=note.is_pinned
    )
    return serialize(new_note)

@router.get("/doc/{doc_id:uuid}/notes", response_model=List[NoteOut], dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def list_notes_by_doc(doc_id: UUID):
    notes = get_notes_by_doc(doc_id)
    return [serialize(note) for note in notes]

@router.delete("/{note_id:uuid}", status_code=204, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def remove_note(note_id: UUID, user_id: UUID):
    success = delete_note(note_id, user_id)
    if not success:
        return {"detail": "Note not found or not authorized"}
    return {"detail": "Note deleted successfully"}

@router.put("/{note_id:uuid}", response_model=NoteOut, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def modify_note(note_id: UUID, user_id: UUID, content: str):
    updated_note = update_note(note_id, user_id, content, is_pinned=True)
    if not updated_note:
        return {"detail": "Note not found or not authorized"}
    return serialize(updated_note)

@router.get("/{note_id:uuid}", response_model=NoteOut, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def get_note(note_id: UUID):
    note = get_note_by_id(note_id)
    if not note:
        return {"detail": "Note not found"}
    return serialize(note)
