
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from app.utils.auth_dep import get_current_user

from app.db.session import get_session
from app.models.user import User
from app.utils import security

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_session)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    u = User(
        username=payload.username,
        email=payload.email,
        password_hash=security.hash_password(payload.password),
        role="user",
    )
    db.add(u)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    db.refresh(u)

    return {"message": "Utilisateur créé avec succès", "email": u.email}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    access_token = security.create_access_token(sub=user.email, extra={"role": user.role})
    refresh_token = security.create_refresh_token(sub=user.email)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me")
def me(user = Depends(get_current_user)):
    """Renvoie les infos de l'utilisateur connecté à partir du JWT"""
    return {"user": user}