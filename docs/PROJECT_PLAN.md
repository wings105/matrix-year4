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

### Phase B — Persistent learning state
- [x] Backend data model exists for students, progress, quiz attempts, mistakes and stats.
- [x] Worker API implementation exists in source for persisted state operations.
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

## Definition of a usable first release
A first usable release is achieved when:
1. `matrix.0com.my` loads reliably on phone and desktop.
2. Student can complete Day 1–Day 8 checklist and quizzes.
3. Progress, quiz results, mistakes and stats persist in D1.
4. Parent view can read the same persisted progress.
5. PWA can be installed on Android Home Screen.
6. Core flows have been manually verified and recorded in `CHANGELOG.md`.
