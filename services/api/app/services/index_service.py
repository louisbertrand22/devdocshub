
from typing import Dict, Any
from . import search_service

def index_doc_version(doc_version: Dict[str, Any]) -> Dict[str, Any]:
    """
    Indexe une version de doc dans le moteur de recherche.
    doc_version attendu: {id, doc_slug, title, tech, category, version_label, content_plain}
    """
    return search_service.index_document(doc_version)
