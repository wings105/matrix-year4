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
- [ ] Activate `0com.my` Cloudflare zone after nameserver propagation.
- [ ] Connect custom subdomain `matrix.0com.my` to Worker.
- [ ] Verify HTTPS, PWA loading and API health on custom domain.

### Phase B0 — Student identity, multi-profile devices and parent linking
Planned onboarding must work for children who have no phone number and no email address, and must support several learners sharing one phone/tablet/browser.

#### Student registration
- [ ] First launch shows `Daftar Pelajar` / `Log Masuk` instead of requiring email or phone.
- [ ] Parent or learner creates a child profile using the child's display name.
- [ ] Backend creates an immutable internal `student_id` plus a human-friendly generated `student_code` for future device login.
- [ ] Child chooses a 6-digit student PIN. The plain PIN must never be stored in D1.
- [ ] Generate a one-time recovery code for the parent; email/phone recovery can remain optional later.
- [ ] All learning records are keyed by `student_id`, so display-name/PIN changes never lose history.

#### Several learners on one device
- [ ] One browser/device may remember multiple learner profiles.
- [ ] Home/login screen becomes `Siapa yang belajar sekarang?` with large profile cards.
- [ ] Example cards: `Zahra`, `Uwais`, `Hanan`, plus `+ Tambah Pelajar` and `Parent Area`.
- [ ] Switching learner must end/lock the active learner session before the next learner starts.
- [ ] Selecting a remembered learner requests that learner's PIN and then issues a session scoped only to that `student_id`.
- [ ] `Tambah Pelajar` on the same device supports either new registration or existing `student_code + PIN` login.
- [ ] `Remove from this device` removes only the remembered local profile/session; it must NOT delete the student's D1 account or learning history.
- [ ] A friend's profile used on the same phone is only a device profile. It must NOT automatically become linked to the phone owner's parent account.
- [ ] Remembered profile metadata may be stored locally for convenience, but authentication/session secrets must be handled securely.

#### Parent / guardian identity
- [ ] Parent Area has a separate guardian identity (`guardian_id`) from child/student identities.
- [ ] Parent can use a generated `parent_code` + parent PIN/passcode for first release; parent email/phone remains optional and can be added later for recovery/notifications.
- [ ] Parent PIN/passcode is stored only as a salted derived hash; plain credentials are never stored.
- [ ] Trusted-device session means the parent does not need to re-enter the code on every visit, subject to expiry/lock rules.

#### Parent-child linking
- [ ] Add many-to-many relation `guardian_students` (or equivalent) so one parent can manage several children and one child can later be linked to more than one guardian.
- [ ] If the parent creates a new child from Parent Area, that child is linked to the parent automatically.
- [ ] If the student account already exists, linking requires an explicit one-time approval/link code; sharing a device alone is never proof of guardianship.
- [ ] Parent dashboard shows only children linked through the guardian-child relation, not every student profile remembered on that phone.
- [ ] Parent roles should support at least `owner` / `guardian`; future permissions may allow read-only or secondary guardian access.
- [ ] Parent can reset a linked child's PIN without changing/deleting the child's `student_id` or learning history.
- [ ] Unlinking a child from a guardian removes portal access only; it must NOT delete the child account or progress.

#### Authentication/security
- [ ] On the original trusted device, persist a secure session so the child normally taps the profile and enters only the PIN (or can stay signed in according to parent preference).
- [ ] On a new device, child login uses `student_code + student PIN`, or a future parent-approved pairing flow.
- [ ] Add server-side login rate limiting / temporary lockout because a numeric PIN has low entropy.
- [ ] Store only salted password/PIN derivations (for example PBKDF2 via Web Crypto) and session-token hashes; never plain PINs or raw session tokens.
- [ ] Sessions must have actor type (`student` or `guardian`) and actor id, expiry, and revocation support.

Email and phone are intentionally optional for the child. They may be added later only for parent recovery/notifications, not as a prerequisite to learn.

### Phase B — Persistent learning state
- [x] Backend data model exists for students, progress, quiz attempts, mistakes and stats.
- [x] Worker API implementation exists in source for persisted state operations.
- [ ] Extend D1 schema for student auth, guardian auth, sessions, `student_code`, `parent_code`, and guardian-child links without breaking existing learning tables.
- [ ] Verify each persistence API endpoint in production.
- [ ] Wire frontend checklist to D1 instead of browser-only storage.
- [ ] Wire quiz attempts and mistakes to D1.
- [ ] Wire XP, stars, streak and preferred language to D1.
- [ ] Define safe migration/fallback for existing `localStorage` progress.
- [ ] Verify progress survives across browser/device sessions.
- [ ] Verify switching between two student profiles on one device never mixes their progress.
- [ ] Verify Parent Area only reads children explicitly linked to the logged-in guardian.

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
2. Student can register/login without requiring phone or email.
3. Several students can safely switch on one shared device without mixing records.
4. Student can complete Day 1–Day 8 checklist and quizzes.
5. Progress, quiz results, mistakes and stats persist in D1 under the correct `student_id`.
6. Parent view can read only explicitly linked children and reset child PIN safely.
7. PWA can be installed on Android Home Screen.
8. Core flows have been manually verified and recorded in `CHANGELOG.md`.
