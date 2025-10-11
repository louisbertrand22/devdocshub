from sqlalchemy import Column, Text, ForeignKey, DateTime, Boolean
from datetime import datetime
from app.db.base import Base
from app.db.session import get_session
from sqlalchemy.dialects.postgresql import UUID as SAUUID
import uuid

class Note(Base):
    __tablename__ = "notes"

    id = Column(SAUUID, primary_key=True, index=True, default=uuid.uuid4)
    doc_id = Column(SAUUID, ForeignKey("docs.id"))
    user_id = Column(SAUUID, ForeignKey("users.id"))
    content = Column(Text)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_notes_by_doc(doc_id):
    session = next(get_session())
    return session.query(Note).filter(Note.doc_id == doc_id).all()

def insert_note(doc_id, user_id, content, is_pinned=False):
    session = next(get_session())
    new_note = Note(
        doc_id=doc_id,
        user_id=user_id,
        content=content,
        is_pinned=is_pinned
    )
    session.add(new_note)
    session.commit()
    session.refresh(new_note)
    return new_note

def delete_note(note_id, user_id):
    session = next(get_session())
    note = session.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not note:
        return False
    session.delete(note)
    session.commit()
    return True

def update_note(note_id, user_id, content, is_pinned=True):
    session = next(get_session())
    note = session.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not note:
        return None
    note.content = content
    note.updated_at = datetime.utcnow()
    note.is_pinned = note.is_pinned
    session.commit()
    session.refresh(note)
    return note

def get_note_by_id(note_id):
    session = next(get_session())
    return session.query(Note).filter(Note.id == note_id).first()

def get_notes_by_user(user_id):
    session = next(get_session())
    return session.query(Note).filter(Note.user_id == user_id).all()

def get_all_notes():
    session = next(get_session())
    return session.query(Note).all()

def get_count_notes():
    session = next(get_session())
    return session.query(Note).count()

def get_my_notes(user_id):
    session = next(get_session())
    return session.query(Note).filter(Note.user_id == user_id).all()