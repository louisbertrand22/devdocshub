# ⚙️ Service API – DevDocsHub

## 4️⃣ API principale (exemples de routes)

Cette API constitue la **couche centrale de communication** entre le frontend (Next.js) et les services internes (docs, recherche, comptes, etc.).

---

### 🔐 Auth

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| POST | `/auth/register` | Créer un compte utilisateur |
| POST | `/auth/login` | Connexion (JWT) |
| POST | `/auth/refresh` | Rafraîchir le token d’accès |
| GET | `/auth/me` | Obtenir le profil utilisateur connecté |
| POST | `/auth/logout` | Invalider le token en cours |

**Exemple :**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer"
}
```

---

### 📚 Docs

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/docs` | Lister ou filtrer les documentations |
| POST | `/docs` | Créer une nouvelle documentation (admin/maintainer) |
| GET | `/docs/{slug}` | Récupérer une documentation spécifique |
| GET | `/docs/{slug}/versions` | Liste des versions disponibles |
| POST | `/docs/{slug}/versions` | Ajouter une nouvelle version |
| POST | `/docs/import` | Importer une doc depuis un lien externe (GitHub, site officiel) |
| DELETE | `/docs/{slug}` | Supprimer une documentation (admin) |

**Exemple :**
```http
POST /docs/import
Content-Type: application/json

{
  "url": "https://docs.docker.com/engine/reference/run/"
}
```

**Réponse :**
```json
{
  "status": "import_started",
  "job_id": "import_67a23f..."
}
```

---

### 🔍 Recherche

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/search?q=` | Recherche plein texte sur toutes les docs |
| GET | `/search?tech=` | Recherche filtrée par technologie |
| GET | `/search/suggest?q=` | Autocomplétion / suggestions |
| POST | `/search/reindex` | Forcer la réindexation complète (admin) |

**Exemple :**
```http
GET /search?q=nginx+reverse+proxy
```

**Réponse :**
```json
{
  "results": [
    {
      "doc_id": "7a81b3a0",
      "title": "Configurer Nginx en reverse proxy",
      "tech": "nginx",
      "snippet": "Pour configurer Nginx comme reverse proxy...",
      "score": 0.91
    }
  ],
  "count": 1
}
```

---

### ⭐ Collections & Favoris

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/collections` | Lister les collections de l’utilisateur |
| POST | `/collections` | Créer une nouvelle collection |
| GET | `/collections/{id}` | Consulter une collection spécifique |
| POST | `/collections/{id}/items` | Ajouter un document dans une collection |
| DELETE | `/collections/{id}/items/{doc_id}` | Supprimer un document de la collection |
| POST | `/docs/{slug}/star` | Ajouter une étoile à un document |
| DELETE | `/docs/{slug}/star` | Retirer une étoile d’un document |

---

### 🧠 Notes & Annotations

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/docs/{slug}/notes` | Lister les notes liées à un document |
| POST | `/docs/{slug}/notes` | Ajouter une note utilisateur |
| DELETE | `/notes/{note_id}` | Supprimer une note personnelle |

---

### 🧩 Administration

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/admin/users` | Lister les utilisateurs (admin) |
| GET | `/admin/stats` | Statistiques globales du système |
| POST | `/admin/reindex` | Réindexation complète du moteur de recherche |
| POST | `/admin/sync-sources` | Relancer la synchronisation automatique des docs |

---

### 📡 Webhooks internes

| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| POST | `/events/doc-updated` | Notifie le service de recherche d’une mise à jour |
| POST | `/events/import-complete` | Signale la fin d’un import à l’API Gateway |

---

### 🛡️ Authentification & Sécurité

- **JWT Bearer Token** dans l’en-tête `Authorization`.
- **Scopes** :
  - `admin` : gestion complète du système.
  - `maintainer` : ajout/modif docs, reindex partielle.
  - `user` : lecture, favoris, notes, collections.
- **Rate limiting** :
  - `/search` limité à 30 requêtes/minute par IP.
  - `/auth` limité à 10 tentatives/minute.

---

### 🧾 Structure de projet API

```
services/api/
├─ app/
│  ├─ main.py                # Point d’entrée FastAPI
│  ├─ routes/
│  │  ├─ auth.py
│  │  ├─ docs.py
│  │  ├─ search.py
│  │  ├─ collections.py
│  │  ├─ notes.py
│  │  └─ admin.py
│  ├─ models/
│  │  ├─ user.py
│  │  ├─ doc.py
│  │  ├─ collection.py
│  │  └─ note.py
│  ├─ schemas/               # Pydantic models
│  ├─ services/
│  │  ├─ search_service.py
│  │  ├─ import_service.py
│  │  └─ index_service.py
│  ├─ db/                    # SQLAlchemy setup + migrations
│  └─ utils/
│     ├─ security.py
│     ├─ pagination.py
│     └─ rate_limiter.py
├─ tests/
│  ├─ test_auth.py
│  ├─ test_docs.py
│  └─ test_search.py
├─ requirements.txt
└─ Dockerfile
```

---

📘 _Dernière mise à jour : 10 octobre 2025_  
🧩 _Fichier : `services/api/README.md`_  
🧑‍💻 _Mainteneur : [Louis BERTRAND](https://github.com/louisbertrand22)_
