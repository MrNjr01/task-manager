---
name: task-project-management-design
description: Full design spec for a single-organization task and project management system
---

# Task & Project Management System — Design Specification

**Date:** 2026-06-19
**Status:** Approved

---

## 1. System Overview

A single-organization task and project management web application with flat hierarchy assignment, role-based access (admin/member), multiple task views (list, kanban, tree), KPI dashboard, and Docker-based deployment.

**Core principles:**
- Every task must have at least one assignee; self-assignment is allowed
- Anyone can create tasks and assign them to anyone (flat hierarchy)
- Users only see tasks they are assigned to; admins see all data
- Projects support sequential (ordered) and parallel (independent) task groups with subtasks

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                    │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐     │
│  │   React Frontend │◄────►│   Node.js API    │     │
│  │   (Nginx/SPA)    │ REST │   (Express.js)   │     │
│  │   Port 3000      │ JSON │   Port 4000      │     │
│  └──────────────────┘      └────────┬─────────┘     │
│                                    │                 │
│                           ┌────────▼─────────┐      │
│                           │    PostgreSQL     │      │
│                           │    Port 5432      │      │
│                           └───────────────────┘      │
│                                    │                 │
│                           ┌────────▼─────────┐      │
│                           │  Local Storage    │      │
│                           │  (profile photos) │      │
│                           └───────────────────┘      │
└─────────────────────────────────────────────────────┘
```

- **Monorepo root** with `backend/` (Express + Prisma) and `frontend/` (Vite + React + shadcn/ui)
- **Shared `packages/types/`** for shared TypeScript interfaces
- **Nginx** serves React SPA and proxies `/api/*` to Node backend (single origin, no CORS in production)
- **Profile photos** stored on local filesystem (mounted Docker volume), path stored in database

---

## 3. Database Schema

### User

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| designation | VARCHAR(100) | NOT NULL |
| department | VARCHAR(100) | NOT NULL |
| profile_photo | VARCHAR(500) | NULLABLE (file path) |
| role | ENUM('admin', 'member') | DEFAULT 'member' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### Project

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| status | ENUM('active', 'archived') | DEFAULT 'active' |
| created_by | UUID | FK → User.id, NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### Task

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| project_id | UUID | FK → Project.id, NULLABLE (standalone tasks allowed) |
| parent_task_id | UUID | FK → Task.id, NULLABLE (self-referencing for subtasks) |
| title | VARCHAR(300) | NOT NULL |
| description | TEXT | NULLABLE |
| status | ENUM('todo', 'in_progress', 'review', 'done') | DEFAULT 'todo' |
| priority | ENUM('low', 'medium', 'high', 'urgent') | DEFAULT 'medium' |
| due_date | TIMESTAMPTZ | NOT NULL |
| start_date | TIMESTAMPTZ | NOT NULL |
| dep_type | ENUM('none', 'sequential', 'parallel') | DEFAULT 'none' |
| order_index | INTEGER | DEFAULT 0 (ordering within project/parent) |
| created_by | UUID | FK → User.id, NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### TaskAssignment

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| task_id | UUID | FK → Task.id, NOT NULL |
| user_id | UUID | FK → User.id, NOT NULL |
| assigned_by | UUID | FK → User.id, NOT NULL |
| assigned_at | TIMESTAMPTZ | DEFAULT now() |

**Constraints:**
- UNIQUE(task_id, user_id) — a user cannot be assigned to the same task twice
- Every task MUST have at least one TaskAssignment row (enforced at application level)

### Relationships

- **Task → Task (self):** `parent_task_id` enables unlimited subtask depth
- **Task → Project:** Many tasks to one project; `project_id` nullable for standalone tasks
- **Task ↔ User (N:N):** Through TaskAssignment junction table
- **User → Task (created):** One user creates many tasks

### Visibility Rules

- **Members** can only query tasks where `TaskAssignment.user_id = current_user.id`
- **Admins** can query all tasks
- Dashboard KPIs: "My tasks" = tasks where user is assignee; "Delegated" = tasks where `assigned_by = current_user.id` and `user_id != current_user.id`

---

## 4. API Design

All responses follow the envelope: `{ data: ..., pagination: { page, limit, total, pages } }` or `{ error: { code, message } }`.

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Admin | Create a new user (admin only) |
| POST | `/api/auth/login` | Public | Email + password → JWT cookie |
| POST | `/api/auth/logout` | Auth | Clear JWT cookie |
| GET | `/api/auth/me` | Auth | Get current user profile |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users, filter by `?department=&active=&search=` |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update name, designation, department, role, is_active |
| POST | `/api/users/:id/photo` | Upload profile photo (multipart/form-data) |
| DELETE | `/api/users/:id` | Soft delete (set is_active = false) |

### Projects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects user has tasks in; admin sees all |
| POST | `/api/projects` | Auth | Create project |
| GET | `/api/projects/:id` | Auth | Get project with task summary |
| PUT | `/api/projects/:id` | Auth | Edit project (creator or admin) |
| DELETE | `/api/projects/:id` | Auth | Archive project (creator or admin) |

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | List tasks, filter by `?project=&status=&assignee=&priority=&from=&to=` |
| POST | `/api/tasks` | Auth | Create task (must include ≥1 assignee) |
| PUT | `/api/tasks/:id` | Auth | Update task (assignees can edit; admin can edit all) |
| DELETE | `/api/tasks/:id` | Auth | Delete task (creator or admin) |
| POST | `/api/tasks/:id/assign` | Auth | Add assignee(s) |
| DELETE | `/api/tasks/:id/assign/:userId` | Auth | Remove assignee (must leave ≥1 assignee) |
| GET | `/api/tasks/:id/subtasks` | Auth | Get nested subtasks |
| PATCH | `/api/tasks/:id/status` | Auth | Quick status update (kanban drag-drop) |

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Auth | KPIs: pending, in_progress, done, overdue (own tasks) |
| GET | `/api/dashboard/delegated` | Auth | Tasks assigned by user to others, with completion status per person |

---

## 5. Frontend Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── Admin.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── MyKpis.tsx
│   │   │   └── DelegatedKpis.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskKanban.tsx
│   │   │   ├── TaskTree.tsx
│   │   │   ├── ViewSwitcher.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── AssigneePicker.tsx
│   │   ├── projects/
│   │   │   ├── ProjectForm.tsx
│   │   │   └── TaskSequencer.tsx
│   │   ├── admin/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── PhotoUpload.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── TopBar.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useTasks.ts
│   │
│   └── lib/
│       ├── api.ts
│       └── utils.ts
```

### Key UI Behaviors

- **ViewSwitcher:** Three tabs (List | Kanban | Tree), same data, different render
- **ThemeToggle:** Light / Dark / System; persisted in localStorage, applies CSS class on `<html>`
- **Dashboard:** Two KPI sections — "My Tasks" (pending, completed, overdue counts) and "Delegated" (per-person completion bars)
- **TaskKanban:** Columns by status (Todo → In Progress → Review → Done), drag-and-drop between columns updates status
- **TaskTree:** Collapsible nested tree, unlimited depth, inline edit on click
- **TaskForm:** Modal with title, description, start/due dates, priority, multi-user assignee picker, inline subtask add
- **TaskSequencer:** Visual reorder within project; toggle between parallel (side-by-side cards) and sequential (numbered chain)

### Route Guards

- `/login` — public
- `/dashboard`, `/tasks`, `/projects` — authenticated only
- `/admin` — admin only (redirect to `/dashboard` if member)

---

## 6. Security & Error Handling

### Authentication

- Passwords hashed with bcrypt (12 rounds)
- JWT payload: `{ userId, role }`, 24h expiry
- JWT stored in `httpOnly`, `SameSite=Strict` cookie
- Refresh token rotation for extended sessions

### Authorization

- Middleware chain: `authenticate → authorize` on every protected route
- Row-level visibility enforced at query level: member queries always include `WHERE TaskAssignment.user_id = current_user.id`
- Admin role bypasses all authorization checks
- Zod schemas validate every request body before database interaction

### Error Handling

- Global Express error handler returns `{ error: { code, message } }`
- React ErrorBoundary per page prevents full app crash
- `react-hook-form` + Zod resolver for inline form validation errors
- Toast notifications for failed API calls with retry option
- Optimistic updates on kanban drag-and-drop with rollback on failure

### Rate Limiting

- `/api/auth/login`: 5 attempts per minute per IP
- All other routes: 100 requests per minute per user

---

## 7. Deployment

### Production (`docker-compose.yml`)

| Service | Image/Build | Ports | Volumes |
|---------|-------------|-------|---------|
| postgres | postgres:16-alpine | 5432 (internal) | `pgdata:/var/lib/postgresql/data` |
| backend | `./backend` (Dockerfile) | 4000 (internal) | `uploads:/app/uploads` |
| frontend | `./frontend` (Dockerfile) | 80 (host) | — |

- Nginx on frontend container serves static SPA and proxies `/api/*` → `backend:4000`
- Environment variables via `.env` file: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`

### Development (`docker-compose.dev.yml`)

- Vite hot reload (frontend), nodemon (backend)
- PostgreSQL exposed on host port 5432 for external tools
- Prisma Studio available at `localhost:5555`

### First-Run Setup

```bash
docker compose up -d postgres
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node seed-admin.js
```

`seed-admin.js` prompts for admin email, name, designation, department, and password — creates the initial admin user.

---

## 8. Monorepo Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── services/         # Business logic
│   │   ├── prisma/           # Schema, migrations
│   │   └── index.ts          # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/
│   ├── src/                  # See Frontend Structure above
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
├── packages/
│   └── types/                # Shared TypeScript interfaces
│       ├── index.ts
│       └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── package.json              # Root workspace config
```
