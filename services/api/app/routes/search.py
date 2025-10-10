from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/")
async def search(q: str = Query(..., min_length=2)):
    # Placeholder - intégration future avec Meilisearch
    return {"query": q, "results": ["result_1", "result_2"]}
