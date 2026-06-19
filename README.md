# Simple Task Manager

Task and project management system with flat assignment, role-based access, and multi-view task organization.

## Quick Start

```bash
# 1. Copy and configure environment
cp .env.example .env

# 2. Start development environment
npm run dev

# 3. Run database migrations
npm run db:migrate

# 4. Create initial admin user
npm run db:seed

# Frontend: http://localhost:3000
# API: http://localhost:4000
# Prisma Studio: http://localhost:5555
```

## Production

```bash
cp .env.example .env
# Edit .env with production values
npm run build
npm run start
```
