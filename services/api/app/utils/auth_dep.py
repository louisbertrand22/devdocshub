from fastapi import Depends, HTTPException, Header, status
from app.utils import security
from app.models.user import User, get_user_by_email

def get_current_user(authorization: str = Header(default="")) -> User:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization manquante")
    token = authorization.split(" ", 1)[1]
    try:
        payload = security.decode_token(token)
        email = payload["sub"]
        user = get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

def require_roles(*roles):
    """Vérifie que l'utilisateur a un des rôles requis"""
    def wrapper(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
        return user
    return wrapper