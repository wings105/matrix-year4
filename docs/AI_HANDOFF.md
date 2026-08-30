# AI HANDOFF — MATRIX Tahun 4

Last updated: 2026-08-30

Use this as the short operational handoff between AI models/sessions. Read `AGENTS.md` first.

## Current owner direction
Student identity/authentication is now a core feature.

Student registration UX required by owner:
- `Nama`
- learner chooses `ID pelajar`
- ID availability auto-checks after typing stops
- `PIN / Password`
- helper note: `6 digit number`

The app must support several learners sharing one phone and a separate Parent Area linked only to explicit children.

## Repository implementation now on `main`
- Student-chosen public ID with availability endpoint.
- Immutable internal UUID for database relations.
- Six-digit student PIN auth with PBKDF2 + salt.
- Student sessions and login throttling.
- Shared-device learner chooser and profile removal/switching.
- Guardian identity, Parent Code + parent PIN.
- Guardian-child many-to-many model.
- One-time six-digit child Link Code.
- Parent-linked children dashboard, child registration, PIN reset and unlink.
- Authenticated student progress/quiz/stats/mistake APIs.
- Frontend uses authenticated D1 state.
- Service worker avoids caching `/api/*`.
- D1 schema contains backward-compatible migration logic for the old `students` table.
- `scripts/verify-static.mjs` and `.github/workflows/verify.yml` provide repeatable repository checks.
- `main` CI includes a live smoke test against the public Cloudflare Worker.

## Important decision change
Earlier docs said the public student code would be generated. Owner changed this: the learner chooses the public Student ID.

Do not reverse this. See ADR-012 in `docs/DECISIONS.md`.

## Verified live production state
Cloudflare build and public GET smoke tests are now proven:
- Cloudflare Workers Build completed successfully for current `main`.
- Live `/api/health` returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Live `/api/auth/student-id-availability` returned `ok=true`, `valid=true`, `available=true` for a unique CI-generated ID.
- `live-smoke` now repeats these checks on future `main` pushes.

## Still NOT fully verified
Do not yet claim the complete student/guardian flow is shipped until POST/session/manual flows are tested:
1. Register a learner and confirm D1 rows/session.
2. Logout/login with the six-digit PIN.
3. Verify duplicate ID and wrong-PIN/lockout behaviour.
4. Test two learners on one shared device and confirm data isolation.
5. Register guardian and test Link Code / linked-child isolation.
6. Verify checklist/quiz/stats/mistake persistence through real learner sessions.

## Custom domain status
`0com.my` nameservers were changed to Cloudflare and zone activation was still pending during this work. Intended final hostname remains `matrix.0com.my`.

## Exact next safe step
The next action requiring a human browser is now:
1. Open `https://matrix-year4.msg-ebye.workers.dev/`.
2. Register one learner using name + chosen available Student ID + six-digit PIN.
3. Confirm the registration screen/result and send the result/screenshot for verification.

After that:
- test logout/login and persistence,
- add a second learner on the same device,
- test Parent Area linking,
- then update `CHANGELOG.md` only for behaviours actually proven.

## Handoff completion template
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
