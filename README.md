# 🧭 DevDocsHub

**DevDocsHub** is a centralized platform for managing and exploring technical documentation for developers, DevOps engineers, and tech students. It provides a modern, intelligent hub to aggregate, structure, and search documentation across multiple technologies.

---

## 🎯 Project Overview

DevDocsHub aims to create a **centralized and intelligent technical documentation platform** where users can:
- 📚 **Centralize documentation** from various sources (npm, Docker, Python, Nginx, etc.)
- 🔍 **Search efficiently** with advanced full-text and semantic search capabilities
- ⭐ **Organize & annotate** with personal favorites, notes, and collections
- 🤝 **Share knowledge** through community annotations and contributions

---

## 🏗️ Architecture

DevDocsHub is built as a modern, scalable web application with:

- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn/ui (in `apps/web`)
- **Backend API**: FastAPI (Python) with RESTful endpoints (in `services/api`)
- **Database**: PostgreSQL with JSONB support
- **Search Engine**: Meilisearch or Elasticsearch for full-text search
- **Object Storage**: MinIO/S3 for storing Markdown files and assets
- **Infrastructure**: Docker Compose, Nginx reverse proxy, observability with Prometheus/Grafana

For detailed architecture diagrams and component descriptions, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 9.0.0
- **Python** 3.11+
- **Docker** and **Docker Compose** (for full stack)
- **PostgreSQL** 15+

### Development Setup

#### 1. Clone the repository

```bash
git clone https://github.com/louisbertrand22/devdocshub.git
cd devdocshub
```

#### 2. Frontend Setup

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

> **Note**: Make sure your backend API is running at `http://localhost:8000` (default).

For more details, see [`apps/docs/frontend/README_FRONTEND.md`](apps/docs/frontend/README_FRONTEND.md).

#### 3. Backend API Setup

```bash
cd services/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
# Configure database connection, secret keys, etc.

# Run migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

For more details, see [`services/api/README.md`](services/api/README.md).

#### 4. Full Stack with Docker Compose

```bash
# Start all services (frontend, backend, database, search engine)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📂 Project Structure

```
devdocshub/
├─ apps/
│  └─ web/                    # Next.js frontend application
│     ├─ app/                 # App Router pages
│     ├─ components/          # React components
│     ├─ lib/                 # Utilities and helpers
│     └─ public/              # Static assets
├─ packages/
│  ├─ ui/                     # Shared UI component library (shadcn/ui)
│  └─ schemas/                # Shared TypeScript/Zod schemas and API client
├─ services/
│  └─ api/                    # FastAPI backend
│     ├─ app/                 # Application code
│     │  ├─ routes/           # API endpoints
│     │  ├─ models/           # SQLAlchemy models
│     │  ├─ schemas/          # Pydantic schemas
│     │  └─ services/         # Business logic
│     └─ tests/               # Backend tests
├─ docs/                      # Project documentation
│  ├─ ARCHITECTURE.md         # Technical architecture details
│  └─ DOCUMENT_CADRAGE.md     # Project scope and requirements
├─ deploy/                    # Deployment configurations
├─ docker-compose.yml         # Docker orchestration
├─ pnpm-workspace.yaml        # Monorepo workspace configuration
└─ package.json               # Root package configuration
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Technical architecture, component diagrams, and API routes |
| [`docs/DOCUMENT_CADRAGE.md`](docs/DOCUMENT_CADRAGE.md) | Project scope, objectives, and requirements |
| [`apps/docs/frontend/README_FRONTEND.md`](apps/docs/frontend/README_FRONTEND.md) | Frontend setup, tech stack, and development guide |
| [`apps/docs/frontend/CONTRIBUTING.md`](apps/docs/frontend/CONTRIBUTING.md) | Frontend contribution guidelines |
| [`apps/docs/frontend/DEPLOY.md`](apps/docs/frontend/DEPLOY.md) | Frontend deployment instructions |
| [`apps/docs/frontend/ENV.md`](apps/docs/frontend/ENV.md) | Environment variables configuration |
| [`services/api/README.md`](services/api/README.md) | Backend API documentation and endpoints |

---

## 🛠️ Key Features

### ✅ Current Features
- 🔐 User authentication (JWT-based)
- 📚 Documentation management (CRUD operations)
- 🔍 Advanced search with filters
- ⭐ Collections and favorites
- 📝 Personal notes and annotations
- 📦 Version management for documentation
- 🔄 Documentation import from external sources

### 🚧 Planned Features
- 🤖 AI-powered semantic search
- 📊 Documentation comparison tools
- 🌐 Community contributions and ratings
- 📱 Mobile-responsive design enhancements
- 🔔 Notifications and updates

---

## 🧑‍💻 Development

### Frontend

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint
```

### Backend

```bash
cd services/api

# Run tests
pytest

# Run with auto-reload
uvicorn app.main:app --reload

# Generate database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

---

## 🤝 Contributing

We welcome contributions! Please see the contribution guidelines:

- **Frontend**: [`apps/docs/frontend/CONTRIBUTING.md`](apps/docs/frontend/CONTRIBUTING.md)
- Keep changes focused and well-tested
- Follow the existing code style
- Write clear commit messages
- Update documentation as needed

---

## 📝 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Validation**: Zod

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Search**: Meilisearch/Elasticsearch
- **Authentication**: JWT (OAuth2)
- **Testing**: Pytest

### Infrastructure
- **Monorepo**: pnpm workspaces + Turborepo
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Observability**: Prometheus + Grafana + Loki

---

## 📄 License

This project is maintained by [Louis BERTRAND](https://github.com/louisbertrand22).

---

## 🔗 Links

- **GitHub**: [louisbertrand22/devdocshub](https://github.com/louisbertrand22/devdocshub)
- **LinkedIn**: [Louis BERTRAND](https://www.linkedin.com/in/louis-bertrand222/)

---

📘 _Last updated: October 11, 2025_  
🧑‍💻 _Maintainer: [Louis BERTRAND](https://github.com/louisbertrand22)_
