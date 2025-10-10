from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
async def stats():
    return {
        "users": 5,
        "docs": 23,
        "collections": 7,
        "search_index_size": "1.2 MB",
    }
