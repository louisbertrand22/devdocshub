
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import docs
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

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(docs.router, prefix="/docs", tags=["Docs"])

@app.get("/", tags=["Root"])
def root():
    return {"message": "Bienvenue sur l’API DevDocsHub 🚀"}
