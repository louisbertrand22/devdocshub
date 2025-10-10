
from typing import Tuple
import requests
from bs4 import BeautifulSoup

def fetch_and_normalize(url: str) -> Tuple[str, str]:
    """
    Récupère une page et extrait un contenu Markdown minimal (titre, texte).
    Retourne (title, content_md).
    """
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    title = soup.title.string.strip() if soup.title else url
    # extraction naïve du texte
    texts = ' '.join([t.get_text(" ", strip=True) for t in soup.find_all(['h1','h2','h3','p','li','code'])])
    content_md = f"# {title}\n\n{texts}"
    return title, content_md
