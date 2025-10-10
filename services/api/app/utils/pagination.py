
from typing import List, Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar('T')

class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int

def paginate(items: List[T], page: int = 1, size: int = 20) -> Page[T]:
    start = (page - 1) * size
    end = start + size
    sliced = items[start:end]
    return Page(items=sliced, total=len(items), page=page, size=size)
