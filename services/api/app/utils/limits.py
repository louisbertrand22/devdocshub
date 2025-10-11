from fastapi import Depends, HTTPException, Request, status
from app.utils.rate_limiter import SimpleRateLimiter

# Instances de limiteurs (par process)
# Ajuste les seuils selon tes besoins
login_limiter   = SimpleRateLimiter(max_calls=10, per_seconds=60)   # 10 req / min / IP
search_limiter  = SimpleRateLimiter(max_calls=30, per_seconds=60)   # 30 req / min / IP
default_limiter = SimpleRateLimiter(max_calls=120, per_seconds=60)  # 120 req / min / IP

def _client_ip(req: Request) -> str:
    """
    Récupère l'IP du client.
    Si tu es derrière un reverse proxy (nginx), active le pass-through d'X-Forwarded-For
    et lis req.headers.get("x-forwarded-for") en priorité.
    """
    xff = req.headers.get("x-forwarded-for")
    if xff:
        # X-Forwarded-For peut contenir une liste "client, proxy1, proxy2"
        return xff.split(",")[0].strip()
    return req.client.host if req.client else "unknown"

def enforce_login_rate(req: Request):
    key = f"login:{_client_ip(req)}"
    if not login_limiter.allow(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de tentatives de connexion. Réessaie dans une minute."
        )

def enforce_search_rate(req: Request):
    key = f"search:{_client_ip(req)}"
    if not search_limiter.allow(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes de recherche. Réessaie dans une minute."
        )

def enforce_default_rate(req: Request):
    key = f"default:{_client_ip(req)}"
    if not default_limiter.allow(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes. Réessaie dans une minute."
        )
