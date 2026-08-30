# AI HANDOFF — MATRIX Tahun 4

Last updated: 2026-08-30

Use this as the short operational handoff between AI models/sessions. Read `AGENTS.md` first.

## Current owner direction
Student identity/authentication is a core feature.

Student registration UX:
- `Nama`
- learner chooses `ID pelajar`
- ID availability auto-checks after typing stops
- `PIN / Password`
- helper note: `6 digit number`

The app must support several learners sharing one phone and a separate Parent Area linked only to explicit children.

## Repository implementation on `main`
- Student-chosen public ID with availability endpoint.
- Immutable internal UUID for database relations.
- Six-digit student PIN auth with PBKDF2 + salt.
- Student sessions and login throttling.
- Shared-device learner chooser and profile switching/removal.
- Guardian identity, Parent Code + parent PIN.
- Guardian-child many-to-many model.
- One-time six-digit child Link Code.
- Parent linked-child dashboard, child registration, PIN reset and unlink.
- Authenticated student progress/quiz/stats/mistake APIs.
- Frontend uses authenticated D1 state.
- Service worker avoids caching `/api/*`.
- Schema v2 migration is live.
- GitHub Actions provides repository verification plus live Worker/custom-domain smoke tests.

## Important product decisions
- Learner chooses public Student ID; do not generate it automatically. See ADR-012.
- Production custom hostname is `school.0com.my`, replacing the earlier planned `matrix.0com.my`. See ADR-015.

## Verified live production state
- Cloudflare Worker build succeeds from `main`.
- Live `/api/health` on workers.dev returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Live Student ID availability endpoint returned valid/available/normalized output.
- `0com.my` Cloudflare zone is active.
- Cloudflare Domains UI shows `school.0com.my` attached to Worker `matrix-year4` in Production.
- Human browser screenshot confirms `https://school.0com.my/` loads the current MATRIX Tahun 4 profile/registration UI over HTTPS.
- GitHub Actions live smoke confirms `school.0com.my` root and `/api/health` are healthy.
- Human Android screenshots confirm the mobile layout, installed PWA icon on the Home Screen, and installed-app launch in standalone-style presentation.

## Still NOT fully verified
Do not claim these complete until manually/runtime tested:
1. Register a learner and confirm D1 rows/session.
2. Logout/login with six-digit PIN.
3. Duplicate ID and wrong-PIN/lockout behaviour.
4. Two learners on one shared device with data isolation.
5. Guardian registration + Link Code + linked-child isolation.
6. Checklist/quiz/stats/mistake persistence through real learner sessions.

## Exact next safe step
Human action required next:
1. Register one learner on `school.0com.my` using `Nama` + chosen available `ID pelajar` + six-digit PIN.
2. Confirm registration result/recovery code and the learner dashboard.
3. Then verify logout/login and persistence before adding a second learner.

After that:
- add a second learner on the same device,
- test Parent Area linking,
- update `CHANGELOG.md` only for behaviours actually proven.

## Handoff completion template
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
