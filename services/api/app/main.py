
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import docs, notes, users, collections
from app.db.init_db import init_db

app = FastAPI(title="DevDocsHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

from fastapi import Request
from fastapi.responses import JSONResponse
from app.utils.limits import default_limiter, _client_ip

@app.middleware("http")
async def global_rate_limit(request: Request, call_next):
    key = f"global:{_client_ip(request)}"
    if not default_limiter.allow(key):
        return JSONResponse(
            status_code=429,
            content={"detail": "Trop de requêtes. Réessaie dans une minute."}
        )
    return await call_next(request)


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(docs.router, prefix="/docs", tags=["Docs"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(collections.router, prefix="/collections", tags=["Collections"])

@app.get("/", tags=["Root"])
def root():
    return {"message": "Bienvenue sur l’API DevDocsHub 🚀"}
