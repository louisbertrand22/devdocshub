from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.utils.auth_dep import require_roles
from datetime import datetime
from app.schemas.user import UserOut
from app.models.user import get_all_users, get_user_by_email, get_user_by_id
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_roles("admin"))])
def list_users():
    """Lister tous les utilisateurs (admin only)."""
    users = get_all_users()
    return users


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_roles("admin"))])
def get_user(user_id: UUID):
    """Afficher les détails d’un utilisateur spécifique (admin only)."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.get("/{email}/by-email", response_model=UserOut, dependencies=[Depends(require_roles("admin"))])
def get_user_by_email(email: str):
    """Afficher les détails d’un utilisateur par son email (admin only)."""
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user