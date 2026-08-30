# CHANGELOG — MATRIX Tahun 4

This file records VERIFIED changes only. Planned or unverified work belongs in `docs/PROJECT_PLAN.md` or `docs/CURRENT_STATE.md`.

## 2026-08-30

### Verified — AI/developer governance documentation
- Added root `AGENTS.md` with mandatory read-before-edit, verification and handoff rules.
- Added `CLAUDE.md` and `.github/copilot-instructions.md` so other AI tools are directed to the same repository rules.
- Added `docs/PROJECT_PLAN.md` with phased roadmap and milestone status.
- Added `docs/CURRENT_STATE.md` separating verified and pending project state.
- Added `docs/DECISIONS.md` with architecture/product ADRs.
- Added `docs/AI_HANDOFF.md` with cross-model continuation context and exact next safe step.
- Added `.github/pull_request_template.md` requiring verification evidence and documentation updates.
- Updated `README.md` so the AI documentation workflow is visible from the repository entry point.

**Verification:** the new files and updated README were confirmed present on GitHub `main` after commit.

### Verified — Cloudflare Worker deployment
- MATRIX Tahun 4 PWA successfully deployed to `https://matrix-year4.msg-ebye.workers.dev/`.
- GitHub `main` is connected to the Cloudflare Worker deployment flow.

**Verification:** Cloudflare build/deploy completed successfully and the live Worker URL was opened successfully.

### Verified — Cloudflare D1 connection and schema
- Created D1 database `matrix-year4-db`.
- Bound D1 to Worker using binding name `DB`.
- Fixed D1 schema initialization so it runs without the unsupported multi-statement PRAGMA flow.
- Application schema includes `students`, `daily_progress`, `quiz_attempts`, `mistakes` and `student_stats`.

**Verification:** `/api/health` manually returned `ok=true`, `database=connected`, `schema=ready`, `tables=6`.

## Rules for future entries
- Do not add a feature just because code was written.
- Add it only after the real change is confirmed by repository inspection, test, deployment, endpoint/UI behaviour, or database evidence.
- If implementation exists but production behaviour is not verified, record it under `PENDING` in `docs/CURRENT_STATE.md` instead.
