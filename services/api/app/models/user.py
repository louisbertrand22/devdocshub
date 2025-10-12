
from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.db.base import Base
from sqlalchemy.dialects.postgresql import UUID as SAUUID
from app.db.session import get_session
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(SAUUID, primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

def get_user_by_email(email: str):
    db_session = next(get_session())
    return db_session.query(User).filter(User.email == email).first()

def get_user_by_id(user_id: SAUUID):
    db_session = next(get_session())
    return db_session.query(User).filter(User.id == user_id).first()

def get_all_users():
    db_session = next(get_session())
    return db_session.query(User).all()

def get_user_with_details_by_email(email: str):
    """Get user with all details by email for the /auth/me endpoint"""
    db_session = next(get_session())
    user = db_session.query(User).filter(User.email == email).first()
    if user:
        return {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
        }
    return None

def serialize(user: User) -> dict:
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
    }