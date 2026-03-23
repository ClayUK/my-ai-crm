This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment

Copy `.env.example` to `.env` and fill in values. Required for full functionality:

- `DATABASE_URL` — **PostgreSQL** connection string (use `?sslmode=require` on Railway and most cloud hosts).
- `ANTHROPIC_API_KEY` — Claude / Anthropic.
- `KIE_API_KEY` — Kie image API.

Optional:

- `KIE_API_BASE`, `KIE_UPLOAD_BASE` — defaults are Kie’s public URLs; override only if needed.
- `SERVER_ACTIONS_ALLOWED_ORIGINS` — comma-separated origins if Server Actions fail with CSRF/origin errors when using **multiple public URLs** (e.g. Railway default hostname + custom domain). Set this on your **build** environment to match.

At server startup, missing `DATABASE_URL` / `ANTHROPIC_API_KEY` / `KIE_API_KEY` are logged (see `instrumentation.ts`).

If **Analyze Fundraiser** falls back to placeholder copy on the job page, an **“Automatic page analysis hit an error”** panel shows the stored exception (`pageEvaluationError` / `pageEvaluationRetryError`); server logs also record `[createCampaign]` / `[analyzeDonationFundraiser]` on failure.

### Railway (PostgreSQL)

1. Add a **PostgreSQL** plugin and copy `DATABASE_URL` into the **web** service variables (Railway often appends SSL params automatically).
2. **Release / deploy command** (before or as part of start): run migrations once per deploy, e.g.  
   `npx prisma migrate deploy`  
   (or add a Railway **Release** phase with that command; keep `npm run start` for the web process.)
3. Ensure `ANTHROPIC_API_KEY` and `KIE_API_KEY` are set on the same service as the Next app.
4. Build: `npm run build` (postinstall runs `prisma generate`; **postbuild** copies `public` and `.next/static` into `.next/standalone` for static assets).
5. Start: `npm run start` runs **`node .next/standalone/server.js`** (Next `output: "standalone"`). Railway sets `PORT` automatically. If the service does not accept external traffic, set **`HOSTNAME=0.0.0.0`** on the service (some hosts require it).

If you later use a **pooled** URL with PgBouncer (transaction mode), add a non-pooled `DIRECT_DATABASE_URL` and Prisma’s `directUrl` in `schema.prisma` per [Prisma docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#external-connection-poolers).

### Fundraiser batch (Claude) tuning

**Fundraiser “Generate 5 ads”** (`generateDonationFundraiserBatchFive`): **extended thinking is on by default** (Haiku 4.5). Optional overrides:

- `ANTHROPIC_FUNDRAISER_BATCH_THINKING=false` — disable thinking (legacy-style call, `max_tokens` 9000).
- `ANTHROPIC_FUNDRAISER_BATCH_MODEL` — e.g. `claude-sonnet-4-5-20250929` for heavier reasoning.
- `ANTHROPIC_FUNDRAISER_BATCH_THINKING_BUDGET` — thinking budget in tokens (min `1024`, default `10000`).
- `ANTHROPIC_FUNDRAISER_BATCH_MAX_TOKENS` — total output cap (default scales with budget; must exceed thinking budget).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
