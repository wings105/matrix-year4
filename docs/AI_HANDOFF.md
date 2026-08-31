# AI HANDOFF — MATRIX Tahun 4

Last updated: 2026-08-31

## Latest verified session — immediate quiz feedback and retry flow

### Requested
- Fix delayed quiz feedback and make a correct answer advance automatically.

### Changed
- Correct answer feedback is rendered synchronously, then the next question loads after about 0.85 seconds while persistence runs in the background.
- First wrong answer gives `Cuba sekali lagi` plus a hint; second wrong answer reveals the correct answer and persists it to `Buku Silap Saya`.
- Added static guards and production E2E coverage for the immediate auto-next and two-step wrong-answer flow. Production cloud assertions use realistic timeouts without changing learner-facing speed.

### Verified
- GitHub Actions production suite `33346987283` passed all `21/21` interaction groups on commit `d68dd7490e4169f523e527659a09f04a6a226bd5`; repository verification `33346987254` passed too.
- Verified paths include immediate correct feedback/auto-next, first-wrong retry, second-wrong Buku Silap entry, XP/module completion, all Day task/checklist interactions, student/guardian flows, linking, reset PIN and parent-created children.

### Still pending
- Wrong-PIN lockout/clear behaviour, multi-learner data isolation, Link Code expiry/one-time reuse, second-device persistence and real-phone visual checks of every source module remain separate checks.

### Next safe step
1. Open the installed PWA on the child's phone, complete one Day 1 module and confirm the immediate feedback, hint and auto-next timing feel clear.
2. Then test two real learner profiles on one device and the wrong-PIN temporary lockout.

Use this as the short operational handoff between AI models/sessions. Read `AGENTS.md` first.

## Current owner direction
The app is now moving from infrastructure/prototype into a real Year 4 learning product. The owner supplied the full Day 1–Day 8 MATRIX preparation PDFs and explicitly asked that the previously planned learning direction be implemented directly inside the learning modules.

Student registration remains:
- `Nama`
- learner chooses `ID pelajar`
- ID availability auto-checks after typing stops
- `PIN / Password`
- helper note: `6 digit number`

The app must support several learners sharing one phone and a separate Parent Area linked only to explicit children.

## Repository implementation on `main`
- Student-chosen public ID with availability endpoint.
- Immutable internal UUID for database relations.
- Six-digit student PIN auth with PBKDF2 + salt, 100,000 iterations for Cloudflare compatibility.
- Student sessions and login throttling.
- Shared-device learner chooser and profile switching/removal.
- Guardian identity, Parent Code + parent PIN.
- Guardian-child many-to-many model and one-time six-digit Link Code.
- Authenticated student progress/quiz/stats/mistake APIs.
- Frontend uses authenticated D1 state.
- Service worker avoids caching `/api/*`.
- Schema v2 is live.

### Structured learning content source
`learning-content.js` is now the structured source for Day 1–Day 8 learning modules. It was derived from the owner's supplied MATRIX Day PDFs and must not be replaced with a generic quiz-only direction without an approved product decision.

Current source-module map:
- Day 1 — `Kenal Tahap Saya`: Math diagnostic, Science diagnostic, BM, English, Buku Silap.
- Day 2 — `Bahasa & Nombor`: whole numbers, operations, BM comprehension, English vocabulary/grammar/reading, Science quick review, writing.
- Day 3 — `Malaysia, Sejarah & Sains`: history/patriotism, scientific process skills, Life Science, mixed Math, language work.
- Day 4 — `Math Power Day`: numbers/operations, fractions-decimals-percent, money-time-measurement, geometry/data, four-step problem solving, Science maintenance.
- Day 5 — `English + Science DLP`: English vocabulary/grammar/reading/writing plus Humans, Animals, Plants and Scientific Skills.
- Day 6 — `STEM Investigation Day`: Light, Sound, Energy, Materials, absorbency fair test, Math measurement/money/time, experiment writing, DLP translation.
- Day 7 — `Akhlak, Keluarga & Consolidation`: Math/Science topik merah, BM/English consolidation, History/RBT, family/reflection.
- Day 8 — `Mini MATRIX Exam + Back to School`: final Math/Science, BM/English, topik merah action plan, 8-day reflection, back-to-school checklist.

Traffic-light policy in learning source:
- HIJAU: 80–100
- KUNING: 60–79
- MERAH: below 60

The learning UI now renders `Modul Pembelajaran Day X`, and `Mula Misi Day Ini` prefers the first incomplete structured module. Objective modules use source-specific questions; activity/writing/STEM/reflection modules can be explicitly marked complete. Completion uses existing `/api/student/progress` with `module-<module-id>` keys.

`scripts/verify-static.mjs` permanently guards the Day 1–Day 8 definitions, key module IDs, source script integration and traffic-light thresholds.

## Verified production state
- Cloudflare Worker / D1 schema v2 remains healthy (`schemaVersion=2`, 11 tables in prior live smoke).
- `school.0com.my` is the production custom domain.
- Android PWA is installed and launches standalone.
- Real learner registration succeeds and enters authenticated cloud-backed dashboard.
- Mobile dashboard layout was polished and owner confirmed it looks good.
- Source-based Day 1–Day 8 integration workflow passed repository/static checks.
- Cloudflare Workers Build succeeded for source-module commit `e851e0c21c585d540f0b66939b849c68356f58d3`, version `434f0ea4-790e-4400-a40c-09a2166b5b6b`.

## Still NOT fully verified
Do not claim these complete until manually/runtime tested:
1. New `Modul Pembelajaran Day X` UI on the actual installed phone.
2. Day switching changes the structured module library correctly.
3. Correct source-module answer updates XP and `module-*` progress in D1. (Verified by production E2E; still check the child-facing phone presentation.)
4. Wrong source-module answer enters `Buku Silap Saya`. (Verified by production E2E; still check the child-facing phone presentation.)
5. Activity module completion survives reload.
6. Day 4 Math Power, Day 6 STEM and Day 8 Mini MATRIX phone flows.
7. Fresh logout/login with same original PIN; wrong-PIN/lockout.
8. Two learners on one shared device with data isolation.
9. Guardian registration, child linking and Parent Area controls. (Verified by production E2E; real-phone review remains useful.)

## Exact next safe step
Human action required next:
1. Relaunch the installed PWA after the latest deployment/cache refresh.
2. Select Day 1 and open `Belajar`.
3. Confirm `Modul Pembelajaran Day 1` is visible with separate source modules such as `Mathematics DLP — Diagnostic` and `Science DLP — Diagnostic`.
4. Open the Mathematics diagnostic module and answer one question.
5. Capture the result so XP/module progress + Buku Silap behaviour can be verified before further runtime claims.

After that, test Day 4, Day 6 and Day 8 module libraries, then continue auth/shared-device/Parent Area verification.

## Handoff completion template
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
