# RAMA Pilot Deployment Runbook

## 1. Prerequisites
- Node.js 20+
- pnpm 9.x
- PostgreSQL 16+
- Redis (for caching & rate limiting)

## 2. Infrastructure Provisioning
- **Database:** Provision a managed PostgreSQL instance (e.g., AWS RDS or Supabase). Ensure `DATABASE_URL` is set.
- **Environment Variables:** Verify all secrets (JWT_SECRET, B2B_API_KEYS) are populated in production secret managers (AWS Secrets Manager / Vercel Environment Variables).

## 3. Deployment Steps
1. **Build Monorepo:** Run `pnpm run build` from the root directory. This builds both `apps/web` (Next.js) and `apps/api` (NestJS).
2. **Database Migrations:** Run `pnpm --filter database migrate:deploy` to apply production schemas.
3. **Start API Services:** Deploy `apps/api` to a Node environment (e.g., ECS, Railway). Start command: `node dist/main.js`.
4. **Start Web Frontend:** Deploy `apps/web` to Vercel or similar edge network.

## 4. Load & Performance Testing
- **Procedure:** Run Artillery or k6 scripts located in `tests/load/` targeting the `/api/v1/properties/search` endpoint.
- **Thresholds:** P95 latency must be < 300ms. Error rate must be < 0.1%.

## 5. Rollback Procedures
- **Database:** Use `pnpm --filter database db:restore <backup-id>` if a migration corrupts data.
- **Application:** Revert the deployment pipeline to the previous stable git SHA.
