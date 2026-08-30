# AI HANDOFF — MATRIX Tahun 4

Last updated: 2026-08-30

Use this as the short operational handoff between AI models/sessions. Read `AGENTS.md` first.

## Current owner direction
Build the child identity system now, not later.

Student registration UX required by owner:
- `Nama`
- learner chooses `ID pelajar`
- ID availability auto-checks after typing stops
- `PIN / Password`
- helper note: `6 digit number`

The app must also support several learners sharing one phone and a separate Parent Area linked only to explicit children.

## Repository implementation prepared
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
- `scripts/verify-static.mjs` and `.github/workflows/verify.yml` were added so future AI/developers have a repeatable repository check.

## Important decision change
Earlier docs said the public student code would be generated. Owner changed this: the learner chooses the public Student ID.

Do not reverse this. See ADR-012 in `docs/DECISIONS.md`.

## Verification status
Source syntax was checked before repository update, but runtime production behaviour is not automatically proven by source existence.

Do NOT claim student/guardian registration is fully shipped until:
1. Cloudflare deploy is confirmed.
2. `/api/health` shows the new schema version.
3. Student ID availability works on live Worker.
4. At least one real student register/login/state flow is tested.
5. Shared-device isolation is tested with two profiles.
6. Guardian link flow is tested.

## Custom domain status
`0com.my` nameservers were changed to Cloudflare and zone activation was still pending during this work. Intended final hostname remains `matrix.0com.my`.

## Exact next safe step
After merge/deploy:
1. Open live `/api/health`.
2. Open `/api/auth/student-id-availability?id=testmatrix`.
3. Test registration UI with a disposable test learner.
4. Confirm the test learner can log out/login and state persists.
5. Test second learner on same device.
6. Test Parent Area link.
7. Record only actually proven runtime behaviour in `CHANGELOG.md`.

## Handoff completion template
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
