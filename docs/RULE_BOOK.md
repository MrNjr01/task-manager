# Simple Task Manager — Rule Book

> This document governs all future development. No feature may be modified without explicit approval. No change may break existing functionality.

---

## R1: Task Assignment Rules

### R1.1 Every task MUST have at least one assignee
- Task creation requires ≥1 assignee ID
- Backend validates `assigneeIds.length >= 1`
- Frontend shows error if no assignee selected

### R1.2 Anyone can assign to anyone (flat hierarchy)
- No role-based assignment restrictions
- Members and admins can assign tasks to any active user

### R1.3 Self-assignment allowed
- User can assign a task to themselves during creation

### R1.4 Deactivated users cannot be assigned
- `/api/users/active` endpoint excludes `isActive = false` users
- Assignment dropdowns only show active users

---

## R2: Task Visibility Rules

### R2.1 Members see only tasks assigned to them
- API filters: `WHERE assignments.userId = current_user_id`
- Members cannot see other users' tasks

### R2.2 Admins see all tasks
- Admin role bypasses visibility filter
- Admin can view, edit, delete any task

### R2.3 Three task scopes
| Scope | Query | Sidebar Label |
|-------|-------|---------------|
| `my` | `assignments.userId = me` | My Tasks |
| `delegated` | `assignments.assignedBy = me AND userId != me` | Delegated |
| `redelegated` | `assignments.reassignedFrom = me` | Redelegated |

---

## R3: Task Status & Completion Rules

### R3.1 Multi-assignee completion
- Each assignee independently marks their completion
- `completedAt` timestamp stored per TaskAssignment
- Task status = `done` ONLY when ALL assignees have `completedAt` set
- If not all completed, status = `in_progress`

### R3.2 Status flow
```
todo → in_progress → review → done
```
- "Mark In Progress" available when status = `todo`
- "Mark Complete" available when status = `todo`, `in_progress`, or `review`
- "Send for Review" available when status = `in_progress`

### R3.3 Completed tasks are locked
- Status = `done` tasks cannot be edited by anyone except admin
- Creator cannot edit completed tasks

---

## R4: Creator Permissions

### R4.1 Only creator can edit (before completion)
- `PUT /api/tasks/:id` checks `task.createdBy === user.id`
- Exception: admin can edit any task

### R4.2 Only creator can delete (before in progress)
- `DELETE /api/tasks/:id` allowed only when `task.status === 'todo'`
- Creator-only; admin can always delete

### R4.3 Creator can un-redelegate
- If task was redelegated, original creator can pull it back
- Available only when task is still `todo`

---

## R5: Redelegation Rules

### R5.1 Redelegation tracking
- `reassignedFrom` field stores original assignee's userId
- Full reassignment chain is traceable

### R5.2 Redelegate flow
```
Original assignee → clicks Redelegate → selects new user →
  old assignment deleted → new assignment created with reassignedFrom = old userId
```

### R5.3 Redelegated task appears in Redelegated view
- Original assignee sees task in "Redelegated" section
- New assignee sees task in "My Tasks"

---

## R6: Project Rules

### R6.1 Project visibility
- Members see only projects they created (`createdBy = me`)
- Admins see all projects

### R6.2 Project editing
- Only creator or admin can edit/archive a project

### R6.3 Subtask timeline constraint
- Subtask `startDate` ≥ parent task `startDate`
- Subtask `dueDate` ≤ parent task `dueDate`
- Frontend validates with date picker `min`/`max` attributes
- Backend rejects out-of-range subtasks

### R6.4 Task dependency types
- `none` — independent task
- `sequential` — must wait for previous sibling
- `parallel` — can run alongside siblings

---

## R7: User Management Rules

### R7.1 Admin-only user management
- Only admins can create, edit, deactivate users
- Members cannot access `/admin` route

### R7.2 Soft delete (deactivate)
- `DELETE /api/users/:id` sets `isActive = false`
- Deactivated users cannot log in or be assigned tasks

### R7.3 Hard delete
- `DELETE /api/users/:id?hard=true` permanently removes user
- Cascades: deletes user's task assignments, tasks, projects

### R7.4 User fields
- `name`, `email`, `designation`, `department`, `profilePhoto`, `role`, `isActive`

---

## R8: Authentication & Security

### R8.1 JWT in httpOnly cookies
- Token stored in `httpOnly`, `SameSite=Strict` cookie
- 24-hour expiry
- Not accessible to JavaScript (XSS protection)

### R8.2 Password hashing
- bcrypt with 12 rounds
- Never stored or transmitted in plain text

### R8.3 Rate limiting
- Login: 5 attempts per minute per IP
- All other API routes: 100 requests per minute per user

### R8.4 Zod validation
- Every request body validated with Zod schemas before database interaction

---

## R9: Dashboard Rules

### R9.1 Three-section layout
```
─────────────────────────────────────┐
│ My Tasks                            │
│ [Pending] [In Progress] [Done] [Overdue] │
│ [Task table]                        │
├─────────────────────────────────────
│ Delegated                           │
│ [Pending] [In Progress] [Done] [Overdue] │
│ [Task table with Assignee column]   │
├─────────────────────────────────────┤
│ Redelegated                         │
│ [Pending] [In Progress] [Done] [Overdue] │
│ [Task table with Assignee column]   │
└─────────────────────────────────────┘
```

### R9.2 KPI calculations
- **Pending**: `status = todo`
- **In Progress**: `status = in_progress OR review`
- **Completed**: `status = done`
- **Overdue**: `dueDate < now AND status != done`

### R9.3 No section may be removed or merged
- All three sections must always be present
- KPI cards (4 per section) must always be present

---

## R10: UI/UX Rules

### R10.1 Theme support
- Light / Dark / System toggle
- Theme persisted in localStorage
- System mode follows `prefers-color-scheme`

### R10.2 Task views
- List, Kanban (drag-drop), Tree (collapsible)
- All views clickable → navigates to Task Detail
- View switcher always visible

### R10.3 Filter and sort
- Filter panel: status, priority, text search
- Sort: due date, priority, status, title (asc/desc toggle)
- Available on all three task views (My/Delegated/Redelegated)

### R10.4 Column rules per view
| View | Columns |
|------|---------|
| My Tasks | Title, Status, Priority, Due, **Assigned By** |
| Delegated | Title, Status, Priority, Due, **Assigned To** |
| Redelegated | Title, Status, Priority, Due, **Assigned By**, **Assigned To** |

---

## R11: API Contract Rules

### R11.1 Response envelope
```json
{ "data": { ... }, "pagination": { "page", "limit", "total", "pages" } }
// or
{ "error": { "code": "...", "message": "..." } }
```

### R11.2 Standard error codes
- `UNAUTHORIZED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `VALIDATION_ERROR` — 400
- `CONFLICT` — 409
- `RATE_LIMITED` — 429

### R11.3 No breaking API changes
- Existing endpoints must maintain backward compatibility
- New fields may be added; existing fields must not be removed or renamed

---

## R12: Development Process Rules

### R12.1 No breaking existing features
- Every change must be tested against all existing features
- If a change breaks an existing feature, it must be rejected

### R12.2 Explicit approval required for modifications
- No existing feature may be modified without explicit user approval
- "Modification" includes: UI changes, API changes, behavior changes, field renames

### R12.3 New features must not conflict with existing rules
- Before implementing a new feature, check against ALL rules in this document
- If a conflict exists, the new feature must be redesigned or the rule must be explicitly updated (with approval)

### R12.4 This rule book is append-only
- New rules are added; existing rules are never deleted
- Rules may be updated only with explicit approval
- Version this document when rules change

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-19 | Initial rule book — all rules from project inception |
