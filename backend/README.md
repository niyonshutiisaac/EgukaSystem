# EgukaSystem Backend — NestJS + Prisma + PostgreSQL (Neon)

Production-grade REST API for the EgukaSystem SaaS platform. Multi-tenant,
horizontally scalable, Redis-cached, free-AI-model powered.

## Stack

- **NestJS 11** (TypeScript, strict) — modular monolith, scaled out behind Nginx
- **PostgreSQL on Neon** — pooled connection (`?pgbouncer=true`) at runtime, direct connection for migrations
- **Prisma 6** — type-safe ORM, migration SQL in `prisma/migrations`
- **Redis** (ioredis) — cache-aside, rate limiting (multi-replica safe), refresh-token allowlist, sale/batch numbering
- **BullMQ-ready** — worker process in `src/workers/worker.ts`
- **Free AI** — Groq free tier → OpenRouter `:free` models → Gemini free tier → Ollama (local) → offline deterministic fallback. Zero AI cost.
- **Docker** — multi-stage image, compose stack with Nginx load balancer, `--scale api=N`

## Architecture highlights

| Concern | Implementation |
|---|---|
| Scale | Stateless API replicas behind Nginx LB; JWT (no session memory); `docker compose up -d --scale api=4` |
| Concurrency | Atomic check-and-decrement stock updates (no lost updates); interactive transactions for sales/batches |
| Speed | Cache-aside Redis (tenant profile, plans, dashboard 60s), keyset pagination, composite `(tenantId, ...)` indexes |
| Safety | Idempotency keys on POS sales (Redis in-flight lock + DB unique constraint), rotating refresh tokens, seat/plan enforcement server-side |
| Tenancy | App-level `tenantId` scoping + `TenantGuard` (RLS is incompatible with Neon's PgBouncer pooling) |
| Errors | Uniform `{ error: { code, message, details } }` envelope, documented codes in `src/common/types/error-codes.ts` |
| Money | Integers only (RWF) — never floats |

## Modules

`auth` · `tenants` (branches) · `plans` (entitlement = role ∩ plan, mirroring frontend `catalog.ts`) · `platform-admin` (registration approval, lifecycle, plan changes) · `users` (seats) · `products` · `inventory` (ledger) · `sales` (idempotent POS, void) · `customers` (balances, payments) · `recipes` (versioned) · `production` (batches: plan→start→complete/waste) · `suppliers` · `expenses` · `notifications` · `reports` (dashboard "6AM view", P&L) · `ai` (free-model insights + credits)

## Getting started

```bash
npm install
cp .env.example .env          # fill in Neon URLs + secrets
npx prisma generate
npm run prisma:seed           # plans + superadmin (from env)
npm run start:dev             # http://localhost:3000/api/v1
```

Swagger docs: http://localhost:3000/docs

Apply the initial schema to Neon:
```bash
npx prisma migrate deploy     # uses DATABASE_URL_DIRECT
```

## Deploy (VPS + Docker)

```bash
cp .env.example .env
docker compose build
docker compose up -d
docker compose up -d --scale api=4
```

Nginx (deploy/nginx.conf) load-balances `api` replicas, TLS-ready, health-checked.
Postgres stays fully managed on Neon — nothing to run.

## Scripts

`npm run lint` · `npm run build` · `npm run test` · `npm run prisma:validate` · `npm run prisma:migrate` (dev) · `npm run prisma:deploy` (prod) · `npm run prisma:seed`

## Environment (see .env.example)

`DATABASE_URL` (pooled) · `DATABASE_URL_DIRECT` (migrations) · `REDIS_URL` · `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` · `CORS_ORIGINS` · `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` · optional AI keys: `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `OLLAMA_URL` — all optional; no key = offline insights still work.