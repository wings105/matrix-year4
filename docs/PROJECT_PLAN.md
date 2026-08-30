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

### Phase B0 — Student identity and registration
Planned onboarding must work for a child who has no phone number and no email address.

Recommended first-release flow:
- [ ] First launch shows `Daftar Pelajar` / `Log Masuk` instead of requiring email or phone.
- [ ] Parent creates the child profile using the child's display name.
- [ ] Backend creates an internal immutable `student_id` plus a human-friendly generated `student_code` for future device login.
- [ ] Child chooses a 6-digit student PIN. The plain PIN must never be stored in D1.
- [ ] Parent chooses a separate parent/admin PIN for Parent Area and PIN reset authority.
- [ ] Generate a one-time recovery code for the parent; email/phone recovery can remain optional later.
- [ ] On the original trusted device, persist a secure session so the child normally taps the profile and enters only the PIN (or can stay signed in according to parent preference).
- [ ] On a new device, login uses `student_code + student PIN`, or a future parent-approved pairing flow.
- [ ] Add server-side login rate limiting / temporary lockout because a numeric PIN has low entropy.
- [ ] Store only salted password/PIN derivations (for example PBKDF2 via Web Crypto) and session-token hashes; never plain PINs or raw session tokens.
- [ ] Every learning record is keyed by `student_id`, so checklist, quiz attempts, mistakes, XP, stars, streak and mastery sync to the same D1 profile across devices.
- [ ] Parent can reset the student's PIN without deleting learning history.

Email and phone are intentionally optional for the child. They may be added later only for parent recovery/notifications, not as a prerequisite to learn.

### Phase B — Persistent learning state
- [x] Backend data model exists for students, progress, quiz attempts, mistakes and stats.
- [x] Worker API implementation exists in source for persisted state operations.
- [ ] Extend D1 schema for `student_code`, PIN/auth metadata and sessions without breaking existing learning tables.
- [ ] Verify each persistence API endpoint in production.
- [ ] Wire frontend checklist to D1 instead of browser-only storage.
- [ ] Wire quiz attempts and mistakes to D1.
- [ ] Wire XP, stars, streak and preferred language to D1.
- [ ] Define safe migration/fallback for existing `localStorage` progress.
- [ ] Verify progress survives across browser/device sessions.

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

## Definition of a usable first release
A first usable release is achieved when:
1. `matrix.0com.my` loads reliably on phone and desktop.
2. Student can register/login without requiring phone or email.
3. Student can complete Day 1–Day 8 checklist and quizzes.
4. Progress, quiz results, mistakes and stats persist in D1 under the same `student_id`.
5. Parent view can read the same persisted progress and reset the child PIN safely.
6. PWA can be installed on Android Home Screen.
7. Core flows have been manually verified and recorded in `CHANGELOG.md`.
