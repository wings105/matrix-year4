# CHANGELOG — MATRIX Tahun 4

This file records VERIFIED changes only. Planned or unverified work belongs in `docs/PROJECT_PLAN.md` or `docs/CURRENT_STATE.md`.

## 2026-08-30

### Verified — live schema v2 + Student ID availability smoke test
- Cloudflare Workers Build for the authentication/shared-device code completed successfully from `main`.
- Added a `live-smoke` CI job for `main` that waits for the Worker and checks the real public endpoint.
- Live `/api/health` returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Live `/api/auth/student-id-availability` returned a valid, available normalized CI-generated Student ID.

**Verification:** GitHub Actions `live-smoke` job completed successfully against `https://matrix-year4.msg-ebye.workers.dev`. This verifies the live Worker is running schema v2 and the public Student ID availability lookup can query the migrated D1 schema.

**Scope note:** student/guardian POST registration, PIN login, shared-device isolation and Parent Area linking still require end-to-end runtime testing and remain pending in `docs/CURRENT_STATE.md`.

### Verified — repository implementation for student auth, shared-device profiles and Parent Area
- Added learner registration UI using `Nama`, learner-chosen `ID pelajar`, and `PIN / Password` with `6 digit number` guidance.
- Added automatic Student ID availability checking after typing stops.
- Added immutable internal student UUID while keeping the chosen public Student ID for login/display.
- Added PBKDF2-SHA256 PIN derivation with random salts, hashed session tokens, expiry/revocation, and login throttling.
- Added shared-device learner profile chooser, profile switching, local profile removal and existing-account login.
- Added separate guardian identity, Parent Code login, guardian-child links, one-time six-digit Link Code, linked-child dashboard, child registration, PIN reset and unlink operations.
- Added authenticated student progress/quiz/stats/mistake APIs and frontend D1 state wiring.
- Extended D1 schema/source with guardian, session, link-code and auth-failure structures plus backward-compatible student auth columns.
- Updated service worker to bypass `/api/*` caching and use network-first navigation.
- Added `scripts/verify-static.mjs` and `.github/workflows/verify.yml`.
- Updated project plan, decisions, current state, handoff and README for the chosen-ID direction.

**Verification:** the feature branch static/contract CI passed; the implementation was fast-forwarded into production branch `main`; subsequent `main` GitHub Actions `Verify repository` runs completed successfully. Checks include Worker JavaScript syntax plus frontend/auth/schema/service-worker contracts.

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

### Verified — Cloudflare D1 connection and schema baseline
- Created D1 database `matrix-year4-db`.
- Bound D1 to Worker using binding name `DB`.
- Fixed D1 schema initialization so it runs without the unsupported multi-statement PRAGMA flow.
- Baseline application schema included `students`, `daily_progress`, `quiz_attempts`, `mistakes` and `student_stats`.

**Verification:** earlier `/api/health` manually returned `ok=true`, `database=connected`, `schema=ready`, `tables=6`; schema-v2 verification is recorded separately above.

## Rules for future entries
- Do not add a feature just because code was written.
- Add it only after the real change is confirmed by repository inspection, test, deployment, endpoint/UI behaviour, or database evidence.
- If implementation exists but production behaviour is not verified, record it under `PENDING` in `docs/CURRENT_STATE.md` instead.
