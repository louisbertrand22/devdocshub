# 🔄 CI/CD Documentation

This document describes the CI/CD pipelines implemented for the DevDocsHub project using GitHub Actions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Pipeline](#deployment-pipeline)
- [Local Testing](#local-testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The DevDocsHub project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

- **Automated Testing**: Runs tests on every push and pull request
- **Build Validation**: Ensures Docker images build successfully
- **Integration Testing**: Tests the full stack with Docker Compose
- **Automated Deployment**: Deploys to production on releases

---

## 🚀 CI/CD Pipeline

**Workflow File**: `.github/workflows/ci-cd.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

### Jobs

#### 1. Frontend CI (`frontend-ci`)
- **Purpose**: Validates the Next.js frontend application
- **Steps**:
  - Checkout code
  - Setup pnpm and Node.js
  - Install dependencies with frozen lockfile
  - Run TypeScript type checking
  - Build Next.js application
  - Upload build artifacts (retained for 7 days)

**Environment Variables**:
- `NEXT_PUBLIC_API_BASE`: API base URL (default: http://localhost:8000)

#### 2. Backend CI (`backend-ci`)
- **Purpose**: Tests the FastAPI backend application
- **Services**:
  - PostgreSQL 15 (test database)
- **Steps**:
  - Checkout code
  - Setup Python 3.11
  - Install dependencies
  - Run pytest with coverage reporting
  - Upload coverage reports to Codecov

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Test JWT secret key
- `JWT_EXPIRE_MINUTES`: Token expiration time

#### 3. Docker Build (`docker-build`)
- **Purpose**: Validates Docker images build successfully
- **Strategy**: Matrix build for both `web` and `api` services
- **Steps**:
  - Checkout code
  - Setup Docker Buildx
  - Build Docker images (without pushing)
  - Use GitHub Actions cache for layer caching

**Build Arguments**:
- `NEXT_PUBLIC_API_BASE`: API base URL for frontend

#### 4. Docker Compose Test (`docker-compose-test`)
- **Purpose**: Integration test of the full stack
- **Steps**:
  - Checkout code
  - Create `.env` file for API service
  - Start all services with `docker compose up`
  - Health check API endpoint (http://localhost:8000/)
  - Health check Web endpoint (http://localhost:3000/)
  - Display logs on failure
  - Cleanup containers and volumes

#### 5. All Checks (`all-checks`)
- **Purpose**: Aggregate status of all CI jobs
- **Dependencies**: All previous jobs must pass
- **Output**: Success message confirming all checks passed

---

## 🚢 Deployment Pipeline

**Workflow File**: `.github/workflows/deploy.yml`

**Triggers**:
- Manual workflow dispatch (with environment selection)
- Push to version tags (e.g., `v1.0.0`)

### Jobs

#### 1. Build and Push (`build-and-push`)
- **Purpose**: Build and publish Docker images to GitHub Container Registry
- **Permissions**: 
  - `contents: read`
  - `packages: write`
- **Strategy**: Matrix build for both `web` and `api` services
- **Steps**:
  - Checkout code
  - Setup Docker Buildx
  - Login to GitHub Container Registry
  - Extract Docker metadata (tags, labels)
  - Build and push Docker images
  - Use GitHub Actions cache

**Image Tags Generated**:
- `ghcr.io/louisbertrand22/devdocshub-web:main`
- `ghcr.io/louisbertrand22/devdocshub-web:v1.0.0`
- `ghcr.io/louisbertrand22/devdocshub-web:sha-abc123`
- Same pattern for `api` service

#### 2. Deploy (`deploy`)
- **Purpose**: Deploy to target environment
- **Environment**: production or staging (configurable)
- **Steps**:
  - Checkout code
  - Display deployment notification
  - **Placeholder**: Add your deployment commands here

**Deployment Options**:
- SSH into server and pull new images
- Update Kubernetes manifests
- Trigger cloud provider deployments (AWS, GCP, Azure)
- Update Docker Swarm services

#### 3. Notify (`notify`)
- **Purpose**: Send deployment notifications
- **Runs**: Always (even on failure)
- **Output**: Success or failure message

---

## 🧪 Local Testing

### Frontend Tests

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Type check
cd apps/web
npx tsc --noEmit

# Build
cd ../..
pnpm build
```

### Backend Tests

```bash
# Install dependencies
cd services/api
pip install -r requirements.txt
pip install pytest pytest-cov httpx

# Run tests
pytest --cov=app --cov-report=term

# Run with database
export DATABASE_URL=postgresql://devdoc:devdoc@localhost:5432/devdocs
export JWT_SECRET=test-secret
pytest -v
```

### Docker Tests

```bash
# Build images
docker build -f apps/web/Dockerfile -t devdocshub-web:test .
docker build -f services/api/Dockerfile -t devdocshub-api:test services/api/

# Run integration test
docker compose up -d
sleep 30
curl http://localhost:8000/
curl http://localhost:3000/
docker compose down -v
```

---

## 🔧 Troubleshooting

### Frontend Build Fails

**Common Issues**:
- **TypeScript errors**: Check `npx tsc --noEmit` output
- **Missing dependencies**: Run `pnpm install --frozen-lockfile`
- **Environment variables**: Ensure `NEXT_PUBLIC_API_BASE` is set

**Solution**:
```bash
cd apps/web
npx tsc --noEmit
# Fix TypeScript errors
pnpm build
```

### Backend Tests Fail

**Common Issues**:
- **Database connection**: Ensure PostgreSQL is running
- **Import errors**: Check Python dependencies are installed
- **Environment variables**: Set `DATABASE_URL` and `JWT_SECRET`

**Solution**:
```bash
cd services/api
pip install -r requirements.txt
pytest -v --tb=short
# Review test output
```

### Docker Build Fails

**Common Issues**:
- **Context path**: Ensure Dockerfile paths are correct
- **Build args**: Verify `NEXT_PUBLIC_API_BASE` is passed
- **Dependencies**: Check package.json and requirements.txt

**Solution**:
```bash
# Build with verbose output
docker build -f apps/web/Dockerfile --progress=plain .

# Check logs
docker logs <container_id>
```

### Docker Compose Test Fails

**Common Issues**:
- **Port conflicts**: Check if ports 3000, 8000, 5432, 7701 are in use
- **Services not ready**: Increase sleep time before health checks
- **Environment variables**: Verify `.env` file is created correctly

**Solution**:
```bash
# Check running containers
docker ps

# View logs
docker compose logs api
docker compose logs web

# Clean up and retry
docker compose down -v
docker compose up -d
```

---

## 🔐 Required Secrets

For the deployment workflow, configure these secrets in GitHub:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | ✅ Yes |
| `NEXT_PUBLIC_API_BASE` | Production API URL | Optional |
| Additional deployment secrets | SSH keys, cloud credentials, etc. | Depends on deployment method |

---

## 📊 Status Badges

Add these badges to your README:

```markdown
[![CI/CD Pipeline](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml)
[![Deploy to Production](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml)
```

---

## 🎯 Next Steps

To customize the deployment workflow for your infrastructure:

1. **Update the deploy job** in `.github/workflows/deploy.yml`
2. **Add deployment commands** specific to your hosting platform
3. **Configure secrets** in GitHub repository settings
4. **Test manually** using workflow_dispatch trigger
5. **Tag a release** to trigger automatic deployment

Example deployment commands:

**Docker Server**:
```bash
ssh user@server 'cd /app && docker compose pull && docker compose up -d'
```

**Kubernetes**:
```bash
kubectl set image deployment/web web=${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}-web:${{ github.sha }}
kubectl set image deployment/api api=${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}-api:${{ github.sha }}
```

---

📘 _Last updated: October 11, 2025_  
🧩 _File: `docs/CICD.md`_  
🧑‍💻 _Maintainer: [Louis BERTRAND](https://github.com/louisbertrand22)_
