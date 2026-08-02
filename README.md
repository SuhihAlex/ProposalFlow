# ProposalFlow — Stage 2 UI Foundation

This repository contains the completed Stage 2 UI foundation for ProposalFlow.

## Included

- Next.js App Router + TypeScript
- Tailwind CSS design tokens
- shadcn-compatible UI primitives
- marketing layout, landing page and pricing page
- login, registration and password recovery UI
- responsive application shell with desktop and mobile navigation
- dashboard presentation using demo content
- fixed-scope placeholder pages for later stages

No Supabase, authentication logic, database access, AI, Stripe or email integration is implemented in Stage 2.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Routes

- `/`
- `/pricing`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/clients`
- `/services`
- `/proposals`
- `/proposals/new`
- `/settings/company`
- `/settings/billing`
