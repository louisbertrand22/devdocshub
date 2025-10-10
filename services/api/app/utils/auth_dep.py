from fastapi import Depends, HTTPException, Header, status
from app.utils import security

def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization manquante")
    token = authorization.split(" ", 1)[1]
    try:
        payload = security.decode_token(token)
        return {"email": payload["sub"], "role": payload.get("role", "user")}
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

def require_roles(*roles):
    """Vérifie que l'utilisateur a un des rôles requis"""
    def wrapper(user = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
        return user
    return wrapper