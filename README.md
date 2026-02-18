# DDQ Copilot

DDQ Copilot is a Next.js + Prisma application for handling security questionnaires in an evidence-first workflow:

1. Create a project.
2. Upload knowledge-base documents.
3. Run drafting agent to generate evidence-backed answer drafts.
4. Review/approve answers in queue.
5. Export final package (CSV/JSON).

## Product navigation

- `/` — Product home and quick actions
- `/projects` — Project list
- `/projects/:projectId/kb` — Knowledge Base upload + document list
- `/projects/:projectId/queue` — Question queue and agent run action
- `/questions/:questionId` — Question detail, evidence, draft/approve actions
- `/projects/:projectId/export` — CSV/JSON export

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Prisma ORM
- SQLite (default for local development)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Run migrations and generate Prisma client:

```bash
npx prisma migrate dev
```

4. (Optional) Seed demo data:

```bash
npx prisma db seed
```

5. Start app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — eslint checks
- `npm run smoke:e2e` — e2e smoke chain:
  - create project
  - upload KB document
  - run agent drafting
  - approve answer
  - export CSV/JSON

> `smoke:e2e` expects running app at `http://127.0.0.1:3000` by default.
> Override with `SMOKE_BASE_URL`.

## Current MVP constraints

- Duplicate KB uploads are detected by SHA-256 and reused per project.
- Retrieval is lexical scoring-based.
- Best chunking support is for text-like files (`txt/md/json/xml/csv/yaml`).
- Export supports `CSV` and `JSON` download endpoints.

## Backlog

Detailed backlog (epics → user stories → acceptance criteria):

- `docs/backlog.md`
