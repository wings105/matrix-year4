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

The owner has now started testing the real learner dashboard and reported that the mobile layout looks good, but inner learning/module buttons previously felt non-functional or failed to visibly update.

## Repository implementation on `main`
- Student-chosen public ID with availability endpoint.
- Immutable internal UUID for database relations.
- Six-digit student PIN auth with PBKDF2 + salt.
- PBKDF2 work factor is 100,000 iterations because production Cloudflare rejected 120,000; repository verification prevents values above 100,000.
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

### Learning interaction repair now in source
- `Mula Misi Day Ini` launches the first incomplete task for the selected Day.
- Each Day task has `Buka`/`Ulang`.
- Math/Science/BM/English tasks open the matching practice subject.
- Generic activities get an explicit completion action.
- Correct quiz answer can mark the active Day task complete via the existing D1 progress API.
- Screen navigation scrolls to the top so changing screens is visible on mobile even from a low scroll position.
- Quiz selection rotates through the small bank instead of randomly returning the same question repeatedly.
- Reward badges render locked/unlocked from actual progress.
- `scripts/verify-static.mjs` now checks these interaction contracts.

## Important product decisions
- Learner chooses public Student ID; do not generate it automatically. See ADR-012.
- Production custom hostname is `school.0com.my`. See ADR-015.
- GitHub/main + Worker + D1 remain the architecture source of truth.

## Verified live production state
- Cloudflare Worker build succeeds from `main`.
- Live `/api/health` returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Live Student ID availability endpoint returned valid/available/normalized output.
- `0com.my` Cloudflare zone is active.
- `school.0com.my` is attached to Worker `matrix-year4` in Production.
- Human browser + Android screenshots confirmed the PWA, installed icon and standalone launch.
- Mobile dashboard layout was polished and the owner confirmed the layout looked good.
- First real registration exposed the Cloudflare PBKDF2 100,000 limit; source was corrected.
- After correction, a real learner registration succeeded and the app entered the authenticated learner dashboard, proving registration + immediate student-state load in production.

## Still NOT fully verified
Do not claim these complete until manually/runtime tested:
1. Fresh logout/login with the same six-digit PIN.
2. Duplicate ID and wrong-PIN/lockout behaviour.
3. The newly repaired Day/module interactions on the actual phone.
4. Checklist/quiz/XP/Buku Silap persistence after reload.
5. Two learners on one shared device with data isolation.
6. Guardian registration + Link Code + linked-child isolation.
7. Parent Area controls such as child PIN reset/unlink.

## Exact next safe step
Human action required next:
1. Relaunch the installed PWA after the current deployment finishes.
2. On Day 1 press `Mula Misi Day Ini` or `Buka` on `Mathematics Diagnostic DLP`.
3. Confirm it opens the learning module at the top of the screen.
4. Answer one correct question and confirm XP + Day task/progress visibly update.
5. Then answer one question incorrectly and confirm it appears in `Buku Silap Saya`.

After those are proven:
- update `CHANGELOG.md` for module/progress behaviour,
- test logout/login,
- add second learner and test isolation,
- test Parent Area linking.

## Handoff completion template
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
