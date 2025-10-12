# DevDocsHub 🚀

[![CI/CD Pipeline](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml)
[![Deploy to Production](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml)

A centralized hub for developer documentation with advanced search and AI-powered features.

## 🏗️ Architecture

- **Frontend**: Next.js 14 + React 18 + TailwindCSS (TypeScript)
- **Backend**: FastAPI + SQLAlchemy 2.x + Pydantic v2 (Python 3.11)
- **Database**: PostgreSQL 15+
- **Search**: Meilisearch
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone https://github.com/louisbertrand22/devdocshub.git
cd devdocshub

# Install frontend dependencies
pnpm install

# Start development servers
pnpm dev
```

### Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Meilisearch: http://localhost:7701

## 📦 Project Structure

```
devdocshub/
├── apps/
│   └── web/              # Next.js frontend
├── services/
│   └── api/              # FastAPI backend
├── packages/
│   ├── ui/               # Shared UI components
│   └── schemas/          # Shared schemas
├── deploy/
│   ├── docker-compose.yml
│   └── nginx.conf
└── docs/                 # Documentation
```

## 🧪 Testing

### Frontend Tests

```bash
cd apps/web
pnpm test
```

### Backend Tests

```bash
cd services/api
pip install -r requirements.txt
pip install pytest pytest-cov httpx
PYTHONPATH=. pytest --cov=app
```

## 🔄 CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline with GitHub Actions:

### CI Pipeline (`ci-cd.yml`)
- ✅ Frontend type checking and build
- ✅ Backend tests with pytest
- ✅ Docker image builds
- ✅ Docker Compose integration tests

### Deployment Pipeline (`deploy.yml`)
- 🚢 Builds and pushes Docker images to GitHub Container Registry
- 🚀 Deploys to production/staging environments
- 📢 Deployment notifications

## 📝 Environment Variables

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_APP_NAME=DevDocsHub
```

### Backend (`services/api/.env`)

```env
DATABASE_URL=postgresql://devdoc:devdoc@localhost:5432/devdocs
JWT_SECRET=your-secret-key-here
JWT_EXPIRE_MINUTES=60
JWT_REFRESH_EXPIRE_DAYS=30
```

## 🤝 Contributing

See [CONTRIBUTING.md](apps/docs/frontend/CONTRIBUTING.md) for development guidelines.

## 📄 License

This project is licensed under the MIT License.

## 👥 Maintainer

[Louis BERTRAND](https://github.com/louisbertrand22)
