# Rocketium Collaborative Design Platform

https://www.loom.com/share/d5e8ca8289354de2b3757a4ab48a9073

## Architecture Overview

| Layer | Tech | Purpose |
| --- | --- | --- |
| Client | React + Vite + TypeScript | SPA that renders the design workspace, lists designs, manages authentication state and real‑time presence. |
| State | Redux Toolkit + RTK Thunks | Central store for canvas elements, design metadata, comments, presence and UI feedback (toasts). |
| Styling | Vanilla CSS Modules | Keeps bundle size small while supporting a custom visual language; no heavy UI frameworks. |
| Backend | Node.js (Express) + TypeScript | REST API for auth, design, comment and collaboration flows; Socket.IO gateway for real-time updates. |
| Persistence | MongoDB + Mongoose | Flexible schema for design elements, collaborators, comments, sessions and users. |
| Auth & Sessions | JWT + Session collection | Issued tokens carry `sid` for server-side validation and allow revocation + 5 device/browser limit. |
| Tooling | Vitest, Playwright, ESLint (SonarJS), migrate-mongo | Covers unit/E2E tests, linting and migrations. |

### Library Choices

- **React + Vite** – fast HMR, small dev server footprint, first-class TypeScript.
- **Redux Toolkit** – predictable state transitions, immer-based immutability for complex canvas updates.
- **Socket.IO** – bi-directional updates for canvas sync, cursor presence and comments.
- **Mongoose** – schema modelling with TypeScript typings, middleware for transforms, migration compatibility.
- **Zod** – shared validation logic; fail-fast request validation.
- **Pino + pino-http** – structured logging (JSON in prod, pretty in dev).
- **express-rate-limit** – throttles `/api` to protect backend and align with 5 device/browser rule.
- **bcryptjs** – password hashing for registered users.

## Running the Project

```bash
# backend
cd backend
npm install
npm run dev

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Environment variables live in `backend/.env` and `frontend/.env` (see respective `.env.example` files).

## API Documentation

Base URL: `http://localhost:4000/api`

### Auth

| Method | Path | Description | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Create account (email, password, optional name). | Returns JWT + user payload. |
| `POST` | `/auth/login` | Login with email + password. | Issued token also persists session in DB. |
| `POST` | `/auth/token` | Legacy guest token (still used for internal tooling). | Will be phased out. |
| `POST` | `/auth/forgot-password` | Notify admin for manual reset. | Returns friendly message. |
| `PATCH` | `/auth/profile` | Update display name. | Auth required; prevents handle collisions. |

### Designs

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/designs` | List designs the requester can see (owner or collaborator). |
| `POST` | `/designs` | Create new design; requester becomes owner. |
| `GET` | `/designs/:id` | Fetch design (owner, collaborator or shared). |
| `PUT` | `/designs/:id` | Update design (owner only). |
| `DELETE` | `/designs/:id` | Delete design (owner only; cascades comments). |

### Collaboration Access

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/designs/:id/access-requests` | Request access from owner. |
| `POST` | `/designs/:id/access-requests/:userId` | Owner approves/denies request. |

### Comments

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/designs/:id/comments` | List comments the requester can view. |
| `POST` | `/designs/:id/comments` | Add comment (owner/collaborator). |
| `PUT` | `/designs/:id/comments/:commentId` | Update comment (owner/collaborator). |

All non-auth routes require `Authorization: Bearer <jwt>` header. Tokens embed `sid` so the backend can invalidate sessions exceeding the 5 device limit.

## Database Schema Design

### `users`
```ts
{
  email: string,            // unique
  passwordHash: string,
  displayName: string,      // unique, normalized slug
  createdAt: Date,
  updatedAt: Date
}
```

### `sessions`
```ts
{
  userId: string,
  sessionId: string,        // sid embedded in JWT
  lastUsedAt: Date,
  createdAt: Date
}
```

### `designs`
```ts
{
  name: string,
  width: number,
  height: number,
  ownerId: string,          // references users._id
  ownerName: string,
  elements: DesignElement[], // discriminated union (text/image/shape)
  collaborators: [{
    userId: string,
    userName?: string,
    status: 'pending' | 'approved' | 'denied',
    requestedAt: Date,
    respondedAt?: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### `comments`
```ts
{
  designId: ObjectId,
  authorId?: string,
  authorName: string,
  message: string,
  mentions: string[],
  createdAt: Date,
  updatedAt: Date,
  x?: number,
  y?: number
}
```

## Collaboration & Real-Time Flow

1. Clients authenticate and store JWT in `localStorage`.
2. `Socket.IO` connection is established; clients join design rooms with `{ designId, userId }`.
3. Owner edits emit `design:update` events throttled by Redux slice; receivers reconcile via `applyRemoteUpdate`.
4. Comments and cursor movement are emitted as separate channels.
5. API responses derive `canDelete` and `accessStatus` flags, so the UI can adjust action availability.

## Testing & Quality Gates

- **Vitest** – reducers & thunks.
- **Playwright** – end-to-end creation/edit/persist/delete flow (authenticated).
- **ESLint + SonarJS** – detects duplicate strings and identical function bodies.
- **migrate-mongo** – versioned migrations (`20251107200000_backfill_design_owner.js` ensures legacy designs have owners).

## What Was Cut (and Why)

| Item | Reason |
| --- | --- |
| Automated password reset emails | Requires external infrastructure (SMTP/provider) and UX flows; deferred in favour of “contact admin”. |
| Full RBAC / organization management | Current scope focuses on owner + collaborator model; multi-tenant workspaces would increase complexity of access checks. |
| Fine-grained canvas diffing | Present implementation sends full element arrays; incremental patches would need CRDT/conflict resolution, which is outside MVP. |
| Comprehensive analytics dashboards | Logging is in place via Pino, but charting/metrics stack (e.g. Prometheus) postponed until productization. |
| Load/perf testing suite | Manual validation plus rate limiting is adequate for now; identified as pending task (`prod-4`). |

## Deployment Notes

- Backend expects `NODE_ENV`, `PORT`, `MONGO_URI`, `CLIENT_URLS`, `JWT_SECRET`.
- Frontend reads `VITE_API_URL`.
- Set `app.set('trust proxy', 1)` in production to ensure rate limiting uses correct IP.
- Dockerization not yet included; simple PM2/Heroku style deployment works out of the box.

## Current Status & Next Steps

- ✅ Authentication (register, login, JWT sessions).
- ✅ Owner-only deletion, collaborator requests, real-time canvas & comments.
- ✅ Rate limiting/logging, migration to backfill legacy data.
- ⏳ Pending: expand automated test coverage, document deployment scripts (`prod-4`).

For a visual walkthrough of the flows, refer to the Loom video linked at the top of this README.


