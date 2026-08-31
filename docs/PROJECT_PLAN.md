# PROJECT PLAN — MATRIX Tahun 4

Last reviewed: 2026-08-31

## Product goal
Build a mobile-first, child-friendly Year 4 learning PWA that turns the Day 1–Day 8 holiday revision plan into an interactive learning system and continues into October MATRIX exam preparation.

## Learning scope
- Day 1–Day 8 holiday cycle.
- Mathematics DLP: BM + English.
- Science DLP: BM + English.
- Bahasa Melayu and English.
- Supporting Year 4 revision activities.
- Daily checklist, reflection, XP, stars and streak.
- `Buku Silap Saya` for repeated mistakes.
- Mastery status: green / yellow / red.
- Parent Area separated from the child learning flow.

## Phase A — Infrastructure
- [x] GitHub repository `wings105/matrix-year4`.
- [x] Cloudflare Workers static/PWA deployment.
- [x] D1 database `matrix-year4-db` bound as `DB`.
- [x] `/api/health` verified with D1 connected and schema ready.
- [x] Schema v2 migration verified live (`schemaVersion: 2`, 11 tables).
- [x] Automated live smoke checks on `main` for Worker health/schema and Student ID availability.
- [x] `0com.my` Cloudflare zone activated after nameserver migration.
- [x] Production custom domain configured in Cloudflare as `school.0com.my`.
- [x] Verify `https://school.0com.my/` loads the current PWA successfully.
- [x] Verify `https://school.0com.my/api/health` returns schema-v2 health (`schemaVersion: 2`, 11 tables).
- [x] Verify Android mobile layout, Add to Home Screen/PWA installation and installed-app launch.

## Phase B0 — Student identity, shared devices and Parent Area

### Student registration
Product decision: learner chooses the public Student ID. Backend creates a separate immutable internal `student_id` UUID.

Repository implementation:
- [x] First-launch UI has `Daftar baru` and `Log masuk`.
- [x] Registration fields: `Nama`, learner-chosen `ID pelajar`, `PIN / Password`.
- [x] PIN helper text states `6 digit number`; backend requires exactly six numeric digits.
- [x] Student ID auto-checks availability after typing stops.
- [x] Current Student ID format: normalized lowercase, 3–20 characters, letters/numbers/`-`/`_`.
- [x] Plain PIN is never stored; PBKDF2-SHA256 + random per-user salt is used.
- [x] PBKDF2 work factor is capped at 100,000 for Cloudflare Workers compatibility and guarded by static verification.
- [x] One-time recovery code is returned at registration; only its hash is stored.
- [x] Learning data uses immutable internal UUID, never the public Student ID as ownership key.

Runtime verification:
- [x] Live Student ID availability endpoint verified against production D1.
- [x] Register one real learner and enter authenticated cloud-backed dashboard successfully.
- [ ] Verify fresh logout/login with the same original PIN.
- [x] Verify duplicate Student ID conflict.
- [ ] Verify wrong PIN and temporary lockout end-to-end.

### Several learners on one device
Repository implementation:
- [x] One device can remember multiple learner profile cards.
- [x] Profile chooser asks `Siapa yang belajar sekarang?`.
- [x] Remembered learner metadata is name + public Student ID only.
- [x] Selecting a learner requires that learner's PIN.
- [x] `Tukar Pelajar` logs out/locks the active session before switching.
- [x] `Buang dari device ini` removes only local profile metadata, not D1 records.
- [x] Existing account can be attached using Student ID + PIN.
- [x] Raw bearer session token is session-scoped, not stored inside remembered profile metadata.

Verification still required:
- [ ] Test two learners on one physical browser/device.
- [ ] Confirm checklist, quiz, XP and mistakes never mix between learners.
- [ ] Confirm removing a local profile leaves D1 history intact.

### Parent / guardian identity
Repository implementation:
- [x] Parent Area uses separate `guardian_id`.
- [x] Parent registration uses guardian display name + six-digit parent PIN.
- [x] Backend generates Parent Code + one-time recovery code.
- [x] Parent PIN is salted/derived; plain PIN is never stored.
- [x] Guardian session is separate from student session.
- [x] Remembered parent profile contains only display name + Parent Code.

Verification still required:
- [x] Register/login guardian in production.
- [ ] Confirm parent and student route authorization stays separated.

### Parent-child linking
Repository implementation:
- [x] D1 includes many-to-many `guardian_students`.
- [x] Student can generate a one-time six-digit Link Code with 10-minute expiry.
- [x] Guardian can link an existing student only with a valid Link Code.
- [x] Parent-created child can auto-link to the authenticated guardian.
- [x] Parent dashboard reads only explicitly linked children.
- [x] Parent can reset linked child PIN while preserving student UUID/history.
- [x] Parent can unlink without deleting student progress.
- [x] Same-device membership never implies guardianship.

Verification still required:
- [ ] Verify Link Code expiry and one-time use.
- [ ] Verify friend/sibling profiles on a device do not appear in Parent Area unless linked.
- [ ] Verify unlink removes access only.

### Authentication/security
- [x] Server-side session records use hashed bearer tokens with actor type/id, expiry and revocation.
- [x] Failed-login tracking exists for students and guardians.
- [x] Five failures in the same actor-code/IP scope cause a 10-minute lockout.
- [x] `/api/*` bypasses service-worker cache.
- [x] Navigation is network-first.
- [x] Child phone number/email is not required.
- [ ] Decide later whether long-lived trusted-device sessions are desirable.
- [ ] Add parent recovery workflow around recovery hashes.
- [ ] Optional parent phone/email may be added only for recovery/notifications.

## Phase B — Persistent learning state
Repository implementation:
- [x] Students, progress, quiz attempts, mistakes and stats data model.
- [x] Authenticated state/progress/quiz/stats/mistake Worker APIs.
- [x] Checklist writes to D1 through authenticated session.
- [x] Quiz attempts and wrong answers write to D1.
- [x] XP, stars, streak and DLP language use D1 state.
- [x] Student state loads from D1 after login/registration session.
- [x] Manual legacy-browser checklist import exists.
- [x] Guardians, sessions, link codes, auth failures and guardian-child links exist in schema v2.
- [x] Existing production D1 accepted schema v2 migration successfully.

Production verification still required:
- [x] Verify checklist write/read through the production learner session.
- [x] Verify quiz -> XP/Buku Silap persistence through the production learner session.
- [ ] Verify progress survives reload and second-device login.
- [ ] Verify profile switching never mixes records.
- [ ] Verify Parent Area reads only linked children.

## Phase C — Learning content and UX

### Structured Day 1–Day 8 source content
- [x] Added `learning-content.js` as a structured learning content layer based on the owner's supplied Day 1–Day 8 MATRIX PDFs.
- [x] Every Day has its own theme, goal, target and module list.
- [x] Day 1 diagnostic modules: Math DLP, Science DLP, BM, English, Buku Silap.
- [x] Day 2 Bahasa & Nombor: whole numbers, operations, BM comprehension, English vocabulary/grammar/reading, Science review and writing.
- [x] Day 3 Malaysia/Sejarah/Sains: history/patriotism, scientific process skills, Life Science, mixed Math and language work.
- [x] Day 4 Math Power: numbers/operations, fractions/decimals/percent, money/time/measurement, geometry/data and four-step problem solving.
- [x] Day 5 English + Science: English vocabulary/grammar/reading/writing plus Humans, Animals, Plants and Scientific Skills.
- [x] Day 6 STEM: Light, Sound, Energy, Materials, fair-test absorbency investigation, measurement/money/time and experiment writing/translation.
- [x] Day 7 Consolidation: Math/Science topik merah, BM/English consolidation, History/RBT and family/reflection.
- [x] Day 8 Mini MATRIX: final Math/Science, BM/English, Topik Merah post-holiday plan, reflection and back-to-school checklist.
- [x] Traffic-light thresholds are encoded as HIJAU 80–100, KUNING 60–79, MERAH below 60.
- [x] Source-based objective modules include topic-specific interactive question sets.
- [x] Writing/STEM/reflection modules are represented as explicit activities that can be completed and synced.
- [x] Learning screen shows `Modul Pembelajaran Day X` and changes with selected Day.
- [x] `Mula Misi Day Ini` prefers the first incomplete source module.
- [x] Module progress uses D1-backed `module-<module-id>` task keys.
- [x] Cloudflare build/deploy succeeded for the source-module integration.

Runtime verification still required:
- [x] Production E2E: Day 1 source module -> correct answer -> immediate feedback/auto-next -> XP/module progress.
- [x] Production E2E: first wrong answer retries; second wrong answer -> `Buku Silap Saya`.
- [ ] Human phone review of the child-facing timing and wording for the same flows.
- [ ] Day switching updates module library correctly.
- [ ] Activity modules mark complete and persist after reload.
- [ ] Day 4 Math Power, Day 6 STEM and Day 8 Mini MATRIX render correctly on phone.

### Next content depth
- [ ] Increase each source module from starter interactive questions to a larger bank closer to the full PDF exercise depth.
- [ ] Add guided explanation before practice for difficult topics.
- [ ] Add written-answer input and rubrics for BM/English writing instead of completion-only activity cards.
- [ ] Add STEM observation/result/conclusion input fields for investigations.
- [ ] Add mastery calculation per topic from actual attempts, not only module completion.
- [ ] Build automatic revision queue from `Buku Silap Saya` + red/yellow topics.
- [ ] Add clear parent summary of strengths, weaknesses and completed modules.

## Phase D — MATRIX exam preparation
- [ ] Mini MATRIX timed mode with countdown and submit-at-end behaviour.
- [ ] Exam paper/question-set mode.
- [ ] Topic performance analytics.
- [ ] Automatic red/yellow/green revision priorities.
- [ ] Countdown and weekly preparation plan toward October MATRIX.

## Phase E — AI tutor
Only after the core data flow is reliable:
- [ ] AI explanation for wrong answers.
- [ ] Adaptive questions based on weaknesses.
- [ ] AI-assisted writing feedback.
- [ ] Optional photo/homework review.
- [ ] Parent weekly summary.

## Non-goals for now
- Native Play Store APK is not required for first usable release.
- Multi-school/commercial SaaS is not the current priority.
- Do not add another backend while Cloudflare Workers + D1 meets the need.
- Child email/phone is not required for registration.
- Shared-device presence does not create family/guardian relationship.

## Definition of a usable first release
1. `school.0com.my` loads reliably on phone and desktop.
2. Student can register with name + chosen available Student ID + six-digit PIN without phone/email.
3. Several students can switch safely on one shared device.
4. Student can open and complete Day 1–Day 8 source-based modules/checklists and quizzes.
5. Progress, quiz results, mistakes and stats persist in D1 under the correct internal student UUID.
6. Parent view reads only explicitly linked children and can reset child PIN safely.
7. PWA installs from Android browser/Home Screen.
8. Core runtime flows are manually verified and recorded in `CHANGELOG.md`.
