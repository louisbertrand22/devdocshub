
import os
from typing import List, Dict, Any
import json
import urllib.request
import urllib.parse

MEILI_HTTP = os.getenv("MEILI_HTTP", "http://localhost:7700")
MEILI_INDEX = os.getenv("MEILI_INDEX", "docs")

def _http_get(url: str) -> Dict[str, Any]:
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())

def _http_post(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def search(query: str, filters: Dict[str, str] | None = None) -> Dict[str, Any]:
    q = urllib.parse.quote(query)
    url = f"{MEILI_HTTP}/indexes/{MEILI_INDEX}/search"
    body = {"q": query, "filter": [f"{k} = '{v}'" for k, v in (filters or {}).items()]}
    return _http_post(url, body)

def index_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{MEILI_HTTP}/indexes/{MEILI_INDEX}/documents"
    return _http_post(url, [doc])

def reindex_all(docs: List[Dict[str, Any]]) -> Dict[str, Any]:
    url = f"{MEILI_HTTP}/indexes/{MEILI_INDEX}/documents"
    return _http_post(url, docs)
