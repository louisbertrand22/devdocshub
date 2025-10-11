from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.models.user import User
from app.utils.auth_dep import require_roles
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.schemas.user import UserOut
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_roles("admin"))])
def list_users(db: Session = Depends(get_session)):
    """Lister tous les utilisateurs (admin only)."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_roles("admin"))])
def get_user(user_id: UUID, db: Session = Depends(get_session)):
    """Afficher les détails d’un utilisateur spécifique (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user