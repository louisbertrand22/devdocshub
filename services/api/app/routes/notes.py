from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Note(BaseModel):
    id: int
    doc_id: int
    content: str

FAKE_NOTES = [Note(id=1, doc_id=1, content="Rappel important sur la config")]

@router.get("/", response_model=List[Note])
async def list_notes():
    return FAKE_NOTES

@router.post("/", response_model=Note)
async def add_note(note: Note):
    note.id = len(FAKE_NOTES) + 1
    FAKE_NOTES.append(note)
    return note
