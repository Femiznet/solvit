# Solvit

Backend-only MVP for **Solvit** — a platform where developers share projects, post solutions, and signal quality through likes, difficulty votes, and bookmarks.

## Stack

- **Next.js 16** (App Router, Route Handlers only — no frontend yet)
- **PostgreSQL** + **Drizzle ORM**
- **jose** for stateless session tokens, **bcryptjs** for password hashing
- **Zod** for input validation
- **Scalar** for interactive API docs at `/reference`

## Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally

## Quickstart

```bash
# 1. Clone + install
git clone https://github.com/Femiznet/solvit.git
cd solvit
npm install

# 2. Configure env
cp .env.example .env
# edit .env — set DATABASE_URL, AUTH_SECRET (min 32 chars), optionally SEED_ADMIN_EMAIL/PASSWORD

# 3. Run migrations
npm run db:migrate

# 4. (Optional) Seed admin + sample data
npm run db:seed

# 5. Start dev server
npm run dev
```

Server starts at `http://localhost:3000`. API docs at `/reference`.

## API overview

| Group | Endpoints | Access |
|---|---|---|
| **Health** | `GET /api/health` | Public (no auth) |
| **Auth** | `POST /api/auth/signup`, `/login`, `/logout`, `GET /me` | Public (signup/login) / authed (me) |
| **Categories** | `GET /api/categories`, `POST/PUT/DELETE /api/categories[/{id}]` | Reads public / writes **admin** |
| **Stacks** | `GET /api/stacks`, `POST/PUT/DELETE /api/stacks[/{id}]` | Reads public / writes **admin** |
| **Projects** | `GET /api/projects[/{id}|/search]`, `POST/PUT/DELETE /api/projects[/{id}]` | Reads public / create: authed / update: owner / delete: **owner or admin** |
| **Solutions** | `GET /api/solutions[?projectId]`, `GET/PUT/DELETE /api/solutions[/{id}]`, `POST /api/solutions` | Reads public / create: authed / update: owner / delete: **owner or admin** |
| **Users** | `GET /api/users/{id}`, `PUT /api/users/{id}` (set role), `PUT/DELETE /api/users` | Self-only (update/delete) / admin can delete any / set-role: admin-only. Deleting a user reassigns their projects to a [deleted] ghost account; their solutions are removed. |
| **Engagement** | `POST /api/projects/{id}/like\|bookmark\|vote`, same for solutions | Authed, self-scoped |

All list endpoints support `?limit` (default 20, max 50) and `?offset` (default 0) query parameters for pagination. Responses include a `pagination` object with `total`, `limit`, `offset`, and `hasMore`.

Full OpenAPI spec: `openapi.yaml` (browse at `/reference`).

## Authorization model

- `userId` is **always** resolved server-side from the session token — never trusted from client input.
- Session token sent via `httpOnly` cookie or `Authorization: Bearer` header.
- Two roles: `user` (default) and `admin`.
- Admins can: manage categories/stacks, delete any project/solution/user (moderation), and change user roles.

## Testing

```bash
npm run test:run
```

Unit tests cover auth gating, proxy-guard path classification, and action-level authorization. Uses mocked database calls — no live Postgres required for tests.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:seed` | Seed sample data + optional admin user |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run knip` | Find unused exports/deps |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |

## Project structure

```
src/
  actions/        # Server actions (validation → auth → service call)
  app/api/        # Route handlers (Next.js App Router)
  database/       # Drizzle schema + connection
  lib/auth/       # Session, hashing, proxy-guard, DAL
  services/       # Data access layer (DB queries)
  zod-validators/ # Input schemas
  __tests__/      # Vitest unit tests
  proxy.ts        # Optimistic credential gate (not authorization)
scripts/          # Seed + openapi sync
drizzle/          # Migrations
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ECONNREFUSED` / `Connection refused` on startup | PostgreSQL not running | Start Postgres: `pg_ctl start` or your system service |
| `AUTH_SECRET` too short / `jose` errors | Secret under 32 chars | Set `AUTH_SECRET` to a 32+ character random string in `.env` |
| `relation "X" does not exist` | Migrations not run | Run `npm run db:migrate` before starting the server |
| `db:seed` fails with `tsx: not found` | `tsx` not installed | Run `npm install` (it's a devDependency) |
| 500 errors with no details | Server-side crash | Check `logs/` directory for stack traces |

Verify the server is healthy: `curl http://localhost:3000/api/health` → `{"status":"ok","db":"up",...}`.

## Status

**Backend MVP.** All core domain models, auth, authorization, and CRUD endpoints are implemented and tested. No frontend yet — the API is consumed via curl, tests, or the Scalar reference at `/reference`.
