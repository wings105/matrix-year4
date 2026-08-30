# CURRENT STATE — MATRIX Tahun 4

Last updated: 2026-08-30

This document separates verified repository/configuration facts from pending runtime verification.

## VERIFIED

### Repository / governance
- Repository: `wings105/matrix-year4`.
- Production branch: `main`.
- `AGENTS.md` is the mandatory AI/developer entry point.
- Project roadmap, decisions, changelog, current state and AI handoff documents exist.

### Authentication/shared-device implementation on `main`
- Student registration source uses `Nama` + learner-chosen `ID pelajar` + `PIN / Password` with `6 digit number` guidance.
- Student ID availability auto-checks after typing stops.
- Public Student ID is separate from immutable internal student UUID.
- PINs use PBKDF2-SHA256 with random per-user salt; plain PINs are not stored.
- PBKDF2 uses 100,000 iterations, matching the Cloudflare Workers Web Crypto limit observed in production.
- Static verification fails if a PBKDF2 iteration count above 100,000 is reintroduced.
- Student and guardian bearer sessions are stored server-side as token hashes with expiry/revocation.
- Five failed logins in the same actor-code/IP scope cause a 10-minute lockout.
- Shared-device learner chooser, switching and local-only profile removal exist.
- Guardian identity is separate from student identity.
- Many-to-many guardian-child links and one-time six-digit Link Codes exist.
- Parent Area source supports linked-child list, child registration/linking, PIN reset and unlink.
- Authenticated checklist, quiz, stats, mistakes and D1 state loading are wired in source.
- Service worker bypasses `/api/*` and uses network-first navigation.
- Repository verification is automated in GitHub Actions.

### Real learner registration now succeeds
- The first registration attempt exposed Cloudflare's PBKDF2 limit at 120,000 iterations.
- After changing the work factor to 100,000, a real learner registration succeeded on the installed Android PWA.
- The app entered the authenticated learner dashboard and loaded the learner name, zeroed stats, Day 1 content and cloud-backed state.
- This verifies the registration POST + authenticated student-state load path after the PBKDF2 correction.

**Still not separately verified:** logout then fresh login with the same PIN, duplicate-ID conflict, wrong-PIN throttling/lockout and explicit D1 row inspection.

### Interactive learning module repair in repository
- Home `Mula Misi Day Ini` now opens the first incomplete task for the selected Day instead of only changing screen.
- Each Day task now has a `Buka`/`Ulang` action.
- Subject tasks open the matching Math/Science/BM/English practice module.
- Non-quiz activities can be explicitly marked complete from the learning screen.
- Correct quiz answers can complete the active Day module and persist task progress through the existing D1 API.
- Navigation now scrolls to the top when changing app screens, avoiding mobile taps that appeared to do nothing while the viewport stayed low on the old screen.
- Quick quizzes rotate deterministically instead of randomly returning the same question repeatedly.
- Rewards/badges now render locked/unlocked state from actual progress instead of static text.
- Static repository verification now guards the core interactive module functions.

**Important:** source and static checks are verified. The repaired module interactions still require a human phone test before being claimed as production behaviour in `CHANGELOG.md`.

### Live Worker / D1 schema v2
- Cloudflare Workers Build for current `main` has been operating successfully.
- Live smoke tests run against `https://matrix-year4.msg-ebye.workers.dev`.
- Live `/api/health` returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Existing production D1 accepted the schema-v2 migration path.
- Live Student ID availability endpoint returned valid/available/normalized output for a CI-generated ID.

### Cloudflare zone and production custom domain
- `0com.my` nameservers were changed at the registrar to Cloudflare nameservers.
- Cloudflare shows the `0com.my` zone as active/protected.
- Production hostname is `school.0com.my`.
- Cloudflare Worker Domains UI shows `school.0com.my` attached to Worker `matrix-year4`, Environment `Production`, Zone `0com.my`.
- Human browser verification confirmed `https://school.0com.my/` resolves over HTTPS and renders the current MATRIX Tahun 4 learner/Parent Area UI.
- GitHub Actions live smoke verification against `school.0com.my` succeeded: root HTML contains `MATRIX Tahun 4` and `/api/health` returns connected/ready schema v2 with 11 tables.

### Android mobile / PWA install
- Human phone screenshots confirm `school.0com.my` renders in the mobile layout.
- PWA is installed on the Android Home Screen and appears with the MATRIX app icon.
- The installed app launches in standalone-style mobile presentation without the normal browser address bar.
- Mobile dashboard spacing/columns were subsequently polished and the owner confirmed the layout looked good.

## PENDING / NOT YET FULLY VERIFIED END-TO-END

### Learning module interactions
Need one real-phone pass on the repaired build:
- Day 1–Day 8 buttons update the selected Day.
- `Mula Misi Day Ini` opens the first incomplete task.
- `Buka` on a Math/Science/BM/English task opens the correct subject module.
- a correct answer increases XP and marks the active task complete,
- wrong answer enters `Buku Silap Saya`,
- progress remains after app reload,
- bottom navigation reliably changes screens from any scroll position,
- badges update from real progress.

### Student authentication remainder
Need production proof for:
- fresh logout/login with six-digit PIN,
- duplicate ID returns conflict,
- wrong PIN increments failures,
- temporary lockout activates/clears,
- logout/revocation works.

### Shared-device switching
Need a browser/device test with at least two students:
- each profile opens only its own student state,
- switching locks/revokes prior active session,
- learning records remain separated,
- removing a profile locally does not delete D1 history.

### Parent / guardian portal
Need runtime proof for:
- guardian registration/login,
- Parent Code return,
- Link Code generation/expiry/one-time use,
- guardian sees only linked children,
- parent-created child auto-links,
- child PIN reset revokes child sessions,
- unlink preserves progress.

### Persistent learning state
Need end-to-end proof for checklist, quiz/mistakes, XP/stars, DLP language, mistake mastery, reload and second-device persistence.

## Known next safe steps
1. Relaunch the installed PWA after the functional-module deployment.
2. On Day 1 press `Mula Misi Day Ini` or `Buka` on Mathematics Diagnostic DLP.
3. Answer one question and confirm XP/task progress visibly updates.
4. Verify `Buku Silap` using one intentionally wrong answer.
5. Then verify logout/login before adding a second learner.
6. Test shared-device isolation and Parent Area linking.
7. Record only behaviours actually proven in `CHANGELOG.md`.

## Security notes
- Never commit Cloudflare/API tokens, credentials, PINs or recovery codes.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is a login identity, not a database ownership key.
- Same-device presence is never proof of guardianship.
- Remembered profile metadata must not contain bearer tokens.
