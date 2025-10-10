from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from fastapi import HTTPException
import uuid
from datetime import datetime
from app.db.base import Base
from app.db.session import get_session

class Doc(Base):
    __tablename__ = "docs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    tech = Column(String, nullable=False)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class DocCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=200)
    title: str = Field(..., min_length=2, max_length=300)
    tech: str = Field(..., min_length=1, max_length=100)
    content: str = ""

class DocOut(BaseModel):
    id: str
    slug: str
    title: str
    tech: str
    content: str
    class Config:
        from_attributes = True

def serialize(doc: Doc) -> DocOut:
    return DocOut(
        id=str(doc.id),
        slug=doc.slug,
        title=doc.title,
        tech=doc.tech,
        content=doc.content or "",
    )

def get_all_docs(q: Optional[str] = None, tech: Optional[str] = None, page: int = 1, size: int = 20):
    session = next(get_session())
    query = session.query(Doc)
    if q:
        query = query.filter((Doc.title.ilike(f"%{q}%")) | (Doc.content.ilike(f"%{q}%")))
    if tech:
        query = query.filter(Doc.tech == tech)
    return query.offset((page - 1) * size).limit(size).all()

def get_doc_by_id(doc_id: int):
    session = next(get_session())
    return session.query(Doc).filter(Doc.id == doc_id).first()

def add_doc(slug: str, title: str, tech: str, content: str):
    session = next(get_session())
    exists = session.query(Doc).filter(Doc.slug == slug).first()
    if exists:
        raise HTTPException(status_code=400, detail="Slug déjà utilisé")
    new_doc = Doc(slug=slug, title=title, tech=tech, content=content)
    session.add(new_doc)
    session.commit()
    session.refresh(new_doc)
    return new_doc

def get_doc_by_slug(slug: str):
    session = next(get_session())
    return session.query(Doc).filter(Doc.slug == slug).first()