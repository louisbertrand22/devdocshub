# GitHub Actions Workflows

This document provides a quick reference for all GitHub Actions workflows in this repository.

## 📊 Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline                          │
│                   (ci-cd.yml)                               │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Frontend CI │   │  Backend CI  │   │ Docker Build │
│              │   │              │   │              │
│ • Type Check │   │ • pytest     │   │ • web image  │
│ • Next Build │   │ • Coverage   │   │ • api image  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                  ┌──────────────────┐
                  │ Docker Compose   │
                  │ Integration Test │
                  └──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   All Checks     │
                  │     Passed ✅    │
                  └──────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  Deployment Pipeline                        │
│                   (deploy.yml)                              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────────────┐            ┌──────────────────────┐
│  Build & Push Images │            │  Build & Push Images │
│        (web)         │            │        (api)         │
│                      │            │                      │
│ → ghcr.io/*/web:tag  │            │ → ghcr.io/*/api:tag  │
└──────────────────────┘            └──────────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
                  ┌──────────────────┐
                  │      Deploy      │
                  │   to Production  │
                  └──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   Notification   │
                  │    📢 Status     │
                  └──────────────────┘
```

## 🔄 CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`
- ✅ Manual trigger (workflow_dispatch)

**Jobs:**
1. **frontend-ci** - Validates Next.js application
2. **backend-ci** - Tests FastAPI with pytest
3. **docker-build** - Builds Docker images (web, api)
4. **docker-compose-test** - Integration testing
5. **all-checks** - Aggregate status

**Duration:** ~5-10 minutes

## 🚀 Deployment Pipeline (`deploy.yml`)

**Triggers:**
- ✅ Version tags (e.g., `v1.0.0`, `v2.1.3`)
- ✅ Manual trigger with environment selection

**Jobs:**
1. **build-and-push** - Builds and publishes Docker images
2. **deploy** - Deploys to target environment
3. **notify** - Sends deployment notifications

**Environments:**
- Production (default)
- Staging

**Duration:** ~10-15 minutes

## 🎯 Quick Actions

### Run CI/CD Manually
```bash
# Using GitHub CLI
gh workflow run ci-cd.yml

# Or via GitHub UI
# Actions → CI/CD Pipeline → Run workflow
```

### Deploy Manually
```bash
# Using GitHub CLI
gh workflow run deploy.yml -f environment=production

# Or via GitHub UI
# Actions → Deploy to Production → Run workflow → Select environment
```

### View Workflow Status
```bash
# List recent workflow runs
gh run list --workflow=ci-cd.yml --limit 5

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

## 📝 Status Badges

Add to your README:

```markdown
[![CI/CD](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/ci-cd.yml)
[![Deploy](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml/badge.svg)](https://github.com/louisbertrand22/devdocshub/actions/workflows/deploy.yml)
```

## 🔧 Maintenance

### Update Workflow Dependencies
```yaml
# Update Node.js version
env:
  NODE_VERSION: '20'  # Change here

# Update Python version
env:
  PYTHON_VERSION: '3.11'  # Change here

# Update pnpm version
env:
  PNPM_VERSION: '9.0.0'  # Change here
```

### Add New Test Job
```yaml
new-test-job:
  name: New Test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    # Add your steps here

# Update all-checks dependencies
all-checks:
  needs: [frontend-ci, backend-ci, docker-build, docker-compose-test, new-test-job]
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [CI/CD Guide](../docs/CICD.md)
- [Contributing Guide](../apps/docs/frontend/CONTRIBUTING.md)

---

📘 _Last updated: October 11, 2025_  
🧑‍💻 _Maintainer: [Louis BERTRAND](https://github.com/louisbertrand22)_
