from sqlalchemy import Column, String, ForeignKey, DateTime, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from typing import Iterable, List, Optional
import uuid
from datetime import datetime
from app.db.base import Base
from app.db.session import get_session
from app.schemas.collection import CollectionCreate, CollectionOut, CollectionUpdate

collection_docs = Table(
    "collection_docs",
    Base.metadata,
    Column("collection_id", UUID(as_uuid=True), ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
    Column("doc_id", UUID(as_uuid=True), ForeignKey("docs.id", ondelete="CASCADE"), primary_key=True),
)

class Collection(Base):
    __tablename__ = "collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    docs = relationship("Doc", secondary=collection_docs, back_populates="collections")


def list_collections(owner_id: Optional[UUID] = None, q: Optional[str] = None,
                     page: int = 1, size: int = 20) -> Iterable[Collection]:
    db = next(get_session())
    res = db.query(Collection)
    if owner_id:
        res = res.filter(Collection.owner_id == owner_id)
    if q:
        res = res.filter(Collection.name.ilike(f"%{q}%"))
    return res.offset((page - 1) * size).limit(size).all()

def get_collection(collection_id: UUID):
    db = next(get_session())
    return db.query(Collection).filter(Collection.id == collection_id).first()


def create_collection(owner_id: UUID, collection: CollectionCreate) -> Collection:
    db = next(get_session())
    db_collection = Collection(
        name=collection.name,
        description=collection.description,
        owner_id=owner_id
    )
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection

def update_collection(collection_id: UUID, collection: CollectionUpdate) -> Optional[Collection]:
    db = next(get_session())
    db_collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not db_collection:
        return None
    if collection.name is not None:
        db_collection.name = collection.name
    if collection.description is not None:
        db_collection.description = collection.description
    db.commit()
    db.refresh(db_collection)
    return db_collection

def delete_collection(collection_id: UUID) -> bool:
    db = next(get_session())
    db_collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not db_collection:
        return False
    db.delete(db_collection)
    db.commit()
    return True

def get_count_collections() -> List[CollectionOut]:
    session = next(get_session())
    return session.query(Collection).all()