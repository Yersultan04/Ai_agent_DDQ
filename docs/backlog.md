# DDQ Copilot Backlog

## Epic 1 — Core workflow hardening

### User Story 1.1
As an analyst, I want a single KB upload API so that ingestion is predictable and supportable.

**Acceptance criteria**
- Only one KB upload endpoint is used by UI and docs.
- Deprecated/conflicting KB upload route is removed.
- KB upload returns consistent payload: `ok`, `doc`, `chunkCount`, `warning`.

### User Story 1.2
As a reviewer, I want stable question/answer status transitions so that queue state is trustworthy.

**Acceptance criteria**
- Draft save sets question status to `DRAFTED`.
- Approve sets question status to `APPROVED`.
- Approve without evidence fails and marks GAP for evidence-only projects.

---

## Epic 2 — Quality gates and smoke reliability

### User Story 2.1
As a maintainer, I want an automated smoke chain so regressions are caught before release.

**Acceptance criteria**
- One command executes end-to-end: create project → upload KB → run agent → approve answer → export.
- Smoke command returns non-zero exit code on any failed stage.
- Smoke validates both CSV and JSON exports.

### User Story 2.2
As a maintainer, I want a release checklist tied to smoke checks.

**Acceptance criteria**
- README documents smoke command and expectations.
- Checklist includes migration + lint + smoke.

---

## Epic 3 — Retrieval and ingestion improvements

### User Story 3.1
As an analyst, I want richer document parsing (PDF/DOCX/XLSX) so existing compliance artifacts are reusable.

**Acceptance criteria**
- Ingestion supports at least PDF + DOCX text extraction.
- Non-text uploads produce actionable warnings if parsing fails.
- Parsed text chunks include source references (page/section).

### User Story 3.2
As a reviewer, I want better ranking quality so suggested evidence is more relevant.

**Acceptance criteria**
- Retrieval supports hybrid mode (lexical + vector).
- Evaluation set exists with baseline relevance score.
- Relevance metric improves by agreed threshold over current lexical baseline.

---

## Epic 4 — Collaboration and governance

### User Story 4.1
As a team lead, I want role-based access so responsibilities are separated (analyst/reviewer/admin).

**Acceptance criteria**
- Auth is enabled for app and APIs.
- Project-level RBAC enforced on read/write routes.
- Unauthorized access is denied with auditable events.

### User Story 4.2
As a compliance manager, I want full audit trail so decisions are defensible.

**Acceptance criteria**
- All answer state changes are logged with actor + timestamp.
- Agent run metadata stores progress, completion, and failure reason.
- Export records include generation stats and traceable artifact metadata.

---

## Epic 5 — Product UX and onboarding

### User Story 5.1
As a first-time user, I want product-oriented landing/docs so I can onboard quickly.

**Acceptance criteria**
- Home page presents product workflow and navigation.
- README documents architecture, local setup, routes, and constraints.
- Backlog and roadmap are visible in repository docs.

### User Story 5.2
As a power user, I want bulk actions in queue so I can process large DDQs faster.

**Acceptance criteria**
- Queue supports multi-select actions (approve/assign/mark review).
- Bulk operations provide per-item result summary.
- Bulk action activity is logged for audit trail.
