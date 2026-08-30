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

### Source-based Day 1–Day 8 learning content now implemented
- Added `learning-content.js` as the structured learning-content source for the app.
- The structure is derived from the Day 1–Day 8 MATRIX preparation PDFs supplied by the owner, instead of relying on the earlier tiny demo quiz bank alone.
- Every Day has its own theme, goal, target and module list.
- Modules now cover the planned progression:
  - Day 1 diagnostic: Math DLP, Science DLP, BM, English, Buku Silap.
  - Day 2 Bahasa & Nombor: whole numbers, operations, BM reading, English vocabulary/grammar/reading, Science quick review, writing.
  - Day 3 Malaysia/Sejarah/Sains: history/patriotism, scientific-process skills, Life Science, mixed Math, BM/English.
  - Day 4 Math Power: number/operations, fractions-decimals-percent, money/time/measurement, geometry/data, four-step problem solving, Science maintenance.
  - Day 5 English + Science: vocabulary/grammar, reading/writing, Humans, Animals, Plants, Scientific Skills, light Math/BM.
  - Day 6 STEM: Light, Sound, Energy, Materials, absorbency fair-test investigation, measurement/money/time, experiment writing and DLP translation.
  - Day 7 Consolidation: Math/Science red topics, BM/English consolidation, History/RBT and family/reflection activities.
  - Day 8 Mini MATRIX: final Math and Science sets, BM/English final practice, Topik Merah post-holiday plan, reflection and back-to-school checklist.
- Source-based quiz modules use topic-specific question sets rather than only the original generic four-subject quick quiz.
- Activity/writing/STEM modules are represented as explicit learner modules that can be marked complete and synced.
- The learning screen now renders a `Modul Pembelajaran Day X` library based on the selected Day.
- `Mula Misi Day Ini` selects the first incomplete structured source module when available.
- Module completion uses existing authenticated `/api/student/progress` storage with `module-<module-id>` task keys.
- Green/yellow/red thresholds are represented in the content source as 80–100 / 60–79 / below 60, consistent with the supplied modules.
- The one-time wiring workflow passed its source/static integration checks and was removed after use.
- Cloudflare Workers Build succeeded for commit `e851e0c21c585d540f0b66939b849c68356f58d3`, version `434f0ea4-790e-4400-a40c-09a2166b5b6b`.

**Important:** repository integration and production deployment are verified. Human phone verification of each new Day/module interaction is still pending; do not claim every lesson flow is fully runtime-verified yet.

### Interactive learning module repair in repository
- Home `Mula Misi Day Ini` opens the first incomplete module/task for the selected Day instead of only changing screen.
- Day tasks have `Buka`/`Ulang` actions.
- Subject tasks open matching Math/Science/BM/English practice.
- Non-quiz activities can be explicitly marked complete from the learning screen.
- Correct quiz answers can complete the active module and persist progress through the D1 API.
- Navigation scrolls to the top when changing app screens.
- Quick quizzes rotate instead of randomly returning the same question repeatedly.
- Rewards/badges render locked/unlocked state from actual progress instead of static text.

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

### Structured learning modules
Need real-phone verification for the new source-based library:
- switching Day 1–Day 8 changes the structured module list,
- `Mula Misi Day Ini` opens the correct first incomplete source module,
- quiz modules use their Day/topic-specific questions,
- activity modules can be marked complete,
- correct answers sync XP + `module-*` progress,
- wrong answers still enter `Buku Silap Saya`,
- completed modules remain completed after reload,
- Day 8 red-topic/reflection modules render correctly.

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
1. Relaunch installed PWA after the latest source-module deployment.
2. Open `Belajar` and confirm `Modul Pembelajaran Day 1` appears.
3. Open Mathematics DLP Diagnostic, answer one correct question and verify XP/module completion.
4. Intentionally answer one question wrongly and verify Buku Silap.
5. Switch to Day 4 and Day 6 to verify Math Power and STEM module libraries.
6. Switch to Day 8 and verify Mini MATRIX + Topik Merah modules.
7. Then continue logout/login, shared-device and Parent Area runtime verification.
8. Record only behaviours actually proven in `CHANGELOG.md`.

## Security notes
- Never commit Cloudflare/API tokens, credentials, PINs or recovery codes.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is a login identity, not a database ownership key.
- Same-device presence is never proof of guardianship.
- Remembered profile metadata must not contain bearer tokens.
