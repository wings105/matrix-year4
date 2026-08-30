# PROJECT PLAN — MATRIX Tahun 4

Last reviewed: 2026-08-30

## Product goal
Build a mobile-first, child-friendly Year 4 learning PWA that turns the existing 8-day holiday revision plan into an interactive learning system and then continues into October MATRIX exam preparation.

## Learning scope
- Day 1–Day 8 holiday cycle.
- Mathematics DLP: BM + English.
- Science DLP: BM + English.
- Bahasa Melayu.
- English.
- Supporting Year 4 subjects/activities according to the agreed revision plan.
- Daily checklist, physical/family activities and reflection.
- Buku Silap Saya for repeated mistakes.
- Mastery status: green / yellow / red.
- Parent view separated from child flow.

## Milestones

### Phase A — Infrastructure
- [x] Create GitHub repository `wings105/matrix-year4`.
- [x] Deploy PWA through Cloudflare Workers static assets.
- [x] Create Cloudflare D1 database `matrix-year4-db`.
- [x] Bind D1 to Worker as `DB`.
- [x] Verify D1 connection and schema readiness through `/api/health`.
- [x] Add automated live smoke checks on `main` for Worker health/schema and Student ID availability.
- [ ] Activate `0com.my` Cloudflare zone after nameserver propagation.
- [ ] Connect custom subdomain `matrix.0com.my` to Worker.
- [ ] Verify HTTPS, PWA loading and API health on custom domain.

### Phase B0 — Student identity, shared devices and Parent Area

#### Student registration
Product decision: the learner chooses the public Student ID during registration. The backend still creates an immutable internal `student_id`/UUID for database relations.

Repository implementation:
- [x] First launch UI contains `Daftar baru` and `Log masuk`.
- [x] Registration fields are exactly: learner name, learner-chosen Student ID and PIN/password.
- [x] Student ID is normalized and checked for availability using `/api/auth/student-id-availability`.
- [x] Frontend performs the availability check automatically after the learner stops typing.
- [x] Student ID rule in the current implementation: 3–20 characters using letters, numbers, `-` or `_`.
- [x] PIN helper text states `6 digit number`; backend requires exactly six numeric digits.
- [x] Plain student PIN is not stored. Worker derives a PBKDF2 SHA-256 hash with a per-user random salt.
- [x] Registration returns a one-time recovery code; only its hash is stored.
- [x] Learning data uses immutable internal student UUID, not the public chosen Student ID.

Runtime verification:
- [x] Verify Student ID availability against production D1.
- [ ] Verify successful student registration creates the expected D1 rows.
- [ ] Verify duplicate Student ID returns a conflict.
- [ ] Verify correct/wrong PIN login and temporary lockout end-to-end.

#### Several learners on one device
Repository implementation:
- [x] One browser/device can remember multiple learner profile cards.
- [x] Profile chooser asks `Siapa yang belajar sekarang?`.
- [x] Remembered local metadata is name + public Student ID only.
- [x] Selecting a remembered learner asks for that learner's PIN before a new session is issued.
- [x] `Tukar Pelajar` logs out/locks the active cloud session before showing the chooser.
- [x] `Buang dari device ini` removes only local profile metadata, not D1 records.
- [x] `Tambah / Log masuk` can attach an existing account to the shared device using Student ID + PIN.
- [x] Raw bearer session token is stored only in `sessionStorage`, not the remembered local profile list.

Verification still required:
- [ ] Test two different learners on one physical device.
- [ ] Confirm checklist, quiz, XP and mistakes never cross between learners.
- [ ] Confirm removing a profile locally leaves the account and D1 history intact.

#### Parent / guardian identity
Repository implementation:
- [x] Parent Area uses separate `guardian_id`.
- [x] Parent registration takes guardian display name + 6-digit parent PIN.
- [x] Backend generates a Parent Code for login and one-time recovery code.
- [x] Parent PIN is PBKDF2-derived with a random salt; plain PIN is never stored.
- [x] Guardian session is separate from student session.
- [x] Parent profiles remembered on a device contain only display name + Parent Code.

Verification still required:
- [ ] Register/login guardian in production.
- [ ] Confirm parent session cannot access student-only routes and vice versa.

#### Parent-child linking
Repository implementation:
- [x] D1 model includes many-to-many `guardian_students`.
- [x] Student can generate a one-time six-digit parent Link Code that expires after 10 minutes.
- [x] Guardian can link an existing student only with a valid one-time Link Code.
- [x] Parent can register a new child inside Parent Area and auto-link that child.
- [x] Parent dashboard queries only explicitly linked children.
- [x] Parent can reset a linked child's PIN; existing child sessions are revoked.
- [x] Parent can unlink a child without deleting that child's progress.
- [x] A linked child can be added as a remembered learner profile on the same device, but still needs the child's PIN to log in.

Verification still required:
- [ ] Verify Link Code expiry and one-time use.
- [ ] Verify friend/sibling profiles on a shared device do not appear in Parent Area unless linked.
- [ ] Verify unlink removes access only.

#### Authentication/security
Repository implementation:
- [x] Sessions are server records keyed by hashed bearer tokens with actor type, actor id, expiry and revocation.
- [x] Student and guardian login failure tracking exists.
- [x] Five failed attempts from the same actor-code/IP scope cause a 10-minute temporary lockout.
- [x] `/api/*` is excluded from service-worker cache.
- [x] Service worker navigation is network-first so a newly deployed login UI is not hidden by an old cached shell.
- [x] No phone number or email address is required for child registration.

Still planned:
- [ ] Decide whether trusted-device long-lived sessions are desirable after real household testing.
- [ ] Add parent recovery workflow using the stored recovery hash.
- [ ] Consider optional parent phone/email only for recovery/notifications, never as a child requirement.

### Phase B — Persistent learning state
Repository implementation:
- [x] Data model exists for students, progress, quiz attempts, mistakes and stats.
- [x] Worker exposes authenticated student state/progress/quiz/stats/mistake APIs.
- [x] Frontend checklist writes to D1 through authenticated student session.
- [x] Quiz attempts and wrong answers write to D1.
- [x] XP, stars, streak and DLP language read from/write to D1.
- [x] Student state is loaded from D1 after login.
- [x] Manual legacy-browser checklist import is available to reduce accidental cross-profile migration.
- [x] D1 schema/source contains guardians, sessions, link codes, auth throttling and guardian-child links.

Production verification:
- [x] Confirm the schema v2 migration runs successfully against the existing D1 database (`/api/health`: connected, ready, schemaVersion 2, 11 tables).
- [ ] Verify each authenticated persistence endpoint in production.
- [ ] Verify progress survives browser reload and a second device login.
- [ ] Verify shared-device switching never mixes records.
- [ ] Verify Parent Area only reads linked children.

### Phase C — Learning content and UX
- [ ] Convert Day 1–Day 8 plan into structured content/question data rather than hard-coded prototype-only content.
- [ ] Expand Mathematics question bank by topic and difficulty.
- [ ] Expand Science question bank by topic and scientific-process skill.
- [ ] Expand BM and English activities.
- [ ] Add daily lesson flow: mission -> explanation -> practice -> feedback -> reflection.
- [ ] Add mastery calculation by topic.
- [ ] Add revision queue from Buku Silap Saya.
- [ ] Add clear parent summary of strengths, weaknesses and completed work.

### Phase D — MATRIX exam preparation
- [ ] Mini MATRIX timed mode.
- [ ] Exam paper/question-set mode.
- [ ] Topic performance analytics.
- [ ] Automatic red/yellow/green revision priorities.
- [ ] Countdown and weekly preparation plan toward the October MATRIX exam.

### Phase E — AI tutor (after core data flow is reliable)
- [ ] AI explanation for wrong answers.
- [ ] Adaptive questions based on weaknesses.
- [ ] AI-assisted writing feedback.
- [ ] Optional photo/homework review.
- [ ] Parent weekly summary.

AI features must not be added before the core learning records and verification flow are reliable.

## Non-goals for now
- Native Play Store APK is not required for the first usable release.
- Multi-school / commercial SaaS is not the current priority.
- Do not add another backend platform while Cloudflare Workers + D1 meets the project needs.
- Child email address or phone number is not required for first-release registration.
- Using the same device does not create a family/guardian relationship automatically.

## Definition of a usable first release
A first usable release is achieved when:
1. `matrix.0com.my` loads reliably on phone and desktop.
2. Student can register using name + chosen available Student ID + six-digit PIN without phone/email.
3. Several students can safely switch on one shared device without mixing records.
4. Student can complete Day 1–Day 8 checklist and quizzes.
5. Progress, quiz results, mistakes and stats persist in D1 under the correct immutable student UUID.
6. Parent view can read only explicitly linked children and reset child PIN safely.
7. PWA can be installed on Android Home Screen.
8. Core flows have been manually verified and recorded in `CHANGELOG.md`.
