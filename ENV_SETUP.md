# Environment Configuration Guide

This document explains how to set up environment variables for DevDocsHub in different environments.

## Overview

DevDocsHub uses environment-specific configuration files to manage different deployment scenarios:

- **`.env.dev`** - Development environment (local development)
- **`.env.prod`** - Production environment (deployed infrastructure)
- **`.env.example`** - Template file with all available variables

## Quick Start

### For Local Development

1. **Backend API Setup:**
   ```bash
   cd services/api
   cp .env.example .env.local
   # Edit .env.local with your local settings
   ```
   
   Or use the pre-configured development file:
   ```bash
   cp .env.dev .env.local
   ```

2. **Frontend Setup:**
   ```bash
   cd apps/web
   cp .env.example .env.local
   # Edit .env.local with your local settings
   ```
   
   Or use the pre-configured development file:
   ```bash
   cp .env.dev .env.local
   ```

### For Production Deployment

1. **Backend API Setup:**
   ```bash
   cd services/api
   cp .env.prod .env
   # IMPORTANT: Edit .env and replace all placeholder values
   ```

2. **Frontend Setup:**
   ```bash
   cd apps/web
   cp .env.prod .env
   # IMPORTANT: Edit .env and replace all placeholder values
   ```

## Environment Variables

### Backend API (`services/api`)

| Variable | Description | Development Default | Production |
|----------|-------------|-------------------|------------|
| `DATABASE_URL` | Database connection string | `sqlite:///./devdocshub.db` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens | `dev-secret-key-change-in-production` | **MUST CHANGE** to strong random string |
| `JWT_EXPIRE_MINUTES` | Access token expiration (minutes) | `60` | `60` (recommended) |
| `JWT_REFRESH_EXPIRE_DAYS` | Refresh token expiration (days) | `30` | `30` (recommended) |
| `MEILI_HTTP` | MeiliSearch endpoint URL | `http://localhost:7700` | `http://search:7700` |
| `MEILI_INDEX` | MeiliSearch index name | `docs` | `docs` |
| `S3_ENDPOINT` | S3/MinIO endpoint (optional) | - | `http://minio:9000` |

### Frontend (`apps/web`)

| Variable | Description | Development Default | Production |
|----------|-------------|-------------------|------------|
| `NEXT_PUBLIC_API_BASE` | Backend API URL | `http://localhost:8000` | Your production API URL |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `DevDocsHub` | `DevDocsHub` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (optional) | - | **MUST SET** if using NextAuth |

## Security Notes

### 🔐 Critical Security Requirements for Production

1. **JWT_SECRET**: Generate a strong random secret
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **NEXTAUTH_SECRET**: Generate a strong random secret (if using NextAuth)
   ```bash
   openssl rand -base64 32
   ```

3. **DATABASE_URL**: Use strong passwords for production database
   - Never use default credentials like `devdoc:devdoc`
   - Use long, randomly generated passwords

4. **Never commit `.env`, `.env.local`, `.env.dev`, or `.env.prod` files**
   - These files are already in `.gitignore`
   - Only commit `.env.example` as a template

## Docker Compose

When using docker-compose, the environment files are loaded automatically:

```yaml
# In docker-compose.yml
services:
  api:
    env_file: ./services/api/.env  # Loads environment variables
```

For development with docker-compose:
```bash
cd services/api
cp .env.dev .env
cd ../..
docker-compose up
```

## Troubleshooting

### Backend cannot connect to database
- Check `DATABASE_URL` is correct
- For PostgreSQL, ensure the database server is running
- For SQLite, ensure the path is writable

### Frontend cannot reach API
- Check `NEXT_PUBLIC_API_BASE` matches your backend URL
- Ensure CORS is properly configured in the backend
- For local development, backend should be running on port 8000

### JWT authentication fails
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration settings are reasonable
- Verify the secret hasn't changed between requests

## Additional Resources

- [Frontend Environment Documentation](apps/docs/frontend/ENV.md)
- [API Documentation](services/api/README.md)
- [Docker Compose Configuration](docker-compose.yml)
