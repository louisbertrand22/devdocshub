# 🏗️ Architecture technique – DevDocsHub

## 1️⃣ Vue d’ensemble (Architecture globale)

```mermaid
graph TD
  A[Client Web (Next.js / React)] -->|HTTPS/JSON| B[API Gateway (FastAPI)]
  A -->|WebSocket/Events| B
  B -->|REST| C[Service Docs]
  B -->|REST| D[Service Recherche]
  B -->|REST| E[Service Comptes/Auth]
  C -->|SQL| F[(PostgreSQL)]
  D -->|HTTP| G[Meilisearch/Elasticsearch]
  C -->|Objets| H[(Object Storage S3 / MinIO)]
  B -->|Logs / Metrics| I[Observabilité (Grafana + Prometheus + Loki)]
  B -->|Reverse Proxy| J[Nginx]
```

### 🔍 Description
- **Frontend (UI)** : Application web en **Next.js** / **React**, SSR et SPA.
- **Backend API** : Serveur **FastAPI**, point d’entrée unique, gère les routes et l’auth.
- **Service Docs** : Gestion des documents, versions et importations (scraper, fichiers).
- **Service Recherche** : Moteur de recherche (Meilisearch ou Elasticsearch).
- **Base de données** : PostgreSQL (relationnelle, support JSONB).
- **Object Storage** : MinIO pour stocker les fichiers Markdown, images ou PDF.
- **Nginx** : reverse proxy et gestion du cache statique.
- **Observabilité** : Prometheus (métriques), Grafana (dashboards), Loki (logs).

---

## 2️⃣ Schéma des composants internes

```mermaid
graph LR
  subgraph API Gateway (FastAPI)
    AG1[Router Docs]
    AG2[Router Search]
    AG3[Router Auth]
    AG4[Router Collections]
  end

  subgraph Service Docs
    D1[DocController]
    D2[Importer / Scraper]
    D3[Normalizer (MD -> AST)]
    D4[Versioning Engine]
    D5[Webhook Emitter]
    D6[DAL (SQLAlchemy)]
  end

  subgraph Service Recherche
    S1[IndexWriter]
    S2[QueryEngine]
    S3[Synonym Analyzer]
  end

  subgraph Service Comptes
    U1[AuthController]
    U2[JWT / OAuth2]
    U3[RBAC Policies]
    U4[UserDAL]
  end

  F[(PostgreSQL)]
  G[(Search Engine)]
  H[(S3 / MinIO)]

  AG1-->D1
  AG1-->D2
  AG2-->S2
  AG3-->U1
  D1-->D6-->F
  D2-->H
  D3-->D6
  D5-->S1
  S1-->G
  S2-->G
  U1-->U2
  U4-->F
```

---

## 3️⃣ Modèle de données (ERD)

```mermaid
erDiagram
  USER ||--o{ COLLECTION : owns
  USER ||--o{ STAR : creates
  USER ||--o{ NOTE : writes

  DOC ||--o{ DOC_VERSION : has
  DOC }o--o{ TAG : tagged_by
  DOC ||--o{ SNIPPET : contains
  DOC ||--o{ SOURCE : imported_from

  COLLECTION ||--o{ COLLECTION_ITEM : includes
  DOC ||--o{ COLLECTION_ITEM : appears_in

  STAR }o--|| DOC : stars
  NOTE }o--|| DOC : on

  USER {
    uuid id PK
    text username
    text email
    text password_hash
    text role
    timestamptz created_at
  }

  DOC {
    uuid id PK
    text slug UNIQUE
    text title
    text tech
    text category
    text status
    timestamptz created_at
    timestamptz updated_at
  }

  DOC_VERSION {
    uuid id PK
    uuid doc_id FK
    text version_label
    text content_md
    jsonb content_meta
    uuid storage_obj_id
    bool is_latest
    timestamptz created_at
  }

  TAG {
    uuid id PK
    text name UNIQUE
  }

  SNIPPET {
    uuid id PK
    uuid doc_id FK
    text title
    text language
    text code
  }

  SOURCE {
    uuid id PK
    uuid doc_id FK
    text source_type
    text url
    text license
    timestamptz last_synced_at
  }

  COLLECTION {
    uuid id PK
    uuid owner_id FK
    text name
    text description
    bool is_private
    timestamptz created_at
  }

  COLLECTION_ITEM {
    uuid id PK
    uuid collection_id FK
    uuid doc_id FK
    int position
  }

  STAR {
    uuid id PK
    uuid user_id FK
    uuid doc_id FK
    timestamptz created_at
  }

  NOTE {
    uuid id PK
    uuid user_id FK
    uuid doc_id FK
    text body_md
    timestamptz created_at
  }
```

---

## 4️⃣ API principale (exemples de routes)

### 🔐 Auth
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| POST | `/auth/register` | Créer un compte utilisateur |
| POST | `/auth/login` | Connexion (JWT) |
| GET | `/auth/me` | Profil utilisateur |

### 📚 Docs
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/docs` | Liste et recherche basique |
| POST | `/docs` | Ajouter une doc (maintainer/admin) |
| GET | `/docs/{slug}` | Consulter une documentation |
| POST | `/docs/import` | Importer depuis une URL ou Git |

### 🔍 Recherche
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/search?q=` | Recherche plein texte |
| GET | `/search/suggest?q=` | Suggestions auto |
| POST | `/search/reindex` | Réindexation manuelle |

### ⭐ Collections & favoris
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/collections` | Lister les collections |
| POST | `/collections` | Créer une collection |
| POST | `/docs/{slug}/star` | Ajouter aux favoris |

---

## 5️⃣ Stack technique

| Domaine | Technologie |
|----------|-------------|
| **Frontend** | Next.js 15, React 18, TailwindCSS, Zustand, shadcn/ui |
| **Backend** | FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| **DB** | PostgreSQL 15+ |
| **Recherche** | Meilisearch (MVP) / Elasticsearch (future) |
| **Stockage objets** | MinIO (S3-compatible) |
| **File de tâches** | Redis + Dramatiq (import, indexation) |
| **Infra** | Docker + Nginx + Compose |
| **Auth** | JWT + OAuth2 |
| **Observabilité** | Prometheus, Grafana, Loki |

---

## 🔟 Structure du dépôt

```
devdocshub/
├─ apps/
│  └─ web/                 # Next.js (frontend)
├─ services/
│  └─ api/                 # FastAPI (backend + worker)
├─ packages/
│  ├─ ui/                  # Composants partagés
│  └─ schemas/             # Modèles (Zod / Pydantic)
├─ deploy/
│  ├─ docker-compose.yml
│  ├─ nginx.conf
│  └─ grafana/
├─ migrations/
├─ docs/
│  ├─ DOCUMENT_CADRAGE.md
│  └─ ARCHITECTURE.md
└─ .github/workflows/
   └─ ci.yml
```

---

📘 _Dernière mise à jour : 10 octobre 2025_  
🧑‍💻 _Mainteneur : [Louis BERTRAND](https://github.com/louisbertrand22)_  
🧩 _Dépôt : [https://github.com/louisbertrand22/devdocshub](https://github.com/louisbertrand22/devdocshub)_
