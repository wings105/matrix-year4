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
- PBKDF2 work factor is now 100,000 iterations because the production Cloudflare Worker rejected 120,000; repository verification prevents values above 100,000 from being reintroduced.
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
- First real learner registration attempt exposed a production error: `Pbkdf2 failed: iteration counts above 100000 are not supported (requested 120000)`.
- Source was corrected to 100,000 PBKDF2-SHA256 iterations.
- GitHub `verify` and `live-smoke` passed after the correction.
- Cloudflare Workers Build succeeded for corrected commit `64f1e19350b616ca4d16e748e9846fa59c6c666b`, deploying Worker version `bbf5eaa1-5b31-4469-b3a6-a4cbadc0f040`.

## Still NOT fully verified
Do not claim these complete until manually/runtime tested:
1. Successful learner registration after the PBKDF2 correction, including D1 rows/session and recovery code.
2. Logout/login with six-digit PIN.
3. Duplicate ID and wrong-PIN/lockout behaviour.
4. Two learners on one shared device with data isolation.
5. Guardian registration + Link Code + linked-child isolation.
6. Checklist/quiz/stats/mistake persistence through real learner sessions.

## Exact next safe step
Human action required next:
1. Relaunch or refresh the installed PWA at `school.0com.my`.
2. Retry the same learner registration using the already available chosen ID and six-digit PIN.
3. Confirm the PBKDF2 error is gone and capture the registration result/recovery code/dashboard.
4. Only after successful registration, test logout/login and persistence.

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
