# CURRENT STATE — MATRIX Tahun 4

Last updated: 2026-08-30

This document separates verified repository facts from production/runtime verification. Do not call a feature shipped merely because source code exists.

## VERIFIED

### Repository / governance
- Repository: `wings105/matrix-year4`.
- Production branch: `main`.
- `AGENTS.md` is the mandatory AI/developer entry point.
- Project roadmap, decisions, current state, changelog and handoff documents exist.

### Authentication/shared-device implementation is now on `main`
- Student registration source uses `Nama` + learner-chosen `ID pelajar` + `PIN / Password` with `6 digit number` guidance.
- Student ID availability is checked automatically after typing stops.
- Public Student ID is separate from immutable internal student UUID.
- PIN handling uses PBKDF2-SHA256 with a random per-user salt; plain PINs are not stored.
- Student and guardian bearer sessions are represented server-side by token hashes with expiry/revocation.
- Five failed logins in the same actor-code/IP scope trigger a 10-minute temporary lockout.
- Shared-device learner chooser, learner switching and local-only profile removal exist.
- Parent/guardian identity is separate from learner identity.
- Many-to-many guardian-child links and one-time six-digit Link Codes exist.
- Parent Area source supports linked-child list, registering/linking a child, child PIN reset and unlink.
- Authenticated student checklist, quiz, stats, mistakes and D1 state loading are wired in source.
- Service worker bypasses `/api/*` caching and uses network-first navigation.
- Static repository verification is automated by `scripts/verify-static.mjs` and `.github/workflows/verify.yml`.

**Verification:** feature branch CI passed, the branch was fast-forwarded into `main` at commit `fb5f4c024eee7c7e205b9e9037b96e2527a9fa09`, and the `main` GitHub Actions `Verify repository` run completed successfully.

### Previously verified Cloudflare / D1 baseline
- Worker URL: `https://matrix-year4.msg-ebye.workers.dev/`.
- D1 database: `matrix-year4-db`.
- D1 binding: `DB`.
- Before the authentication expansion, `/api/health` was manually verified with database connected and schema ready.
- Custom domain `matrix.0com.my` is still waiting on `0com.my` Cloudflare zone activation/nameserver propagation.

## PENDING / NOT YET VERIFIED IN PRODUCTION

### Cloudflare deployment of the new authentication build
- GitHub `main` contains the new implementation and repository CI is green.
- The new Cloudflare deployment has not yet been independently confirmed from this session.
- Do not assume the live Worker is already running schema version 2 until `/api/health` is checked.

### New D1 auth schema migration
Source intends to add/migrate:
- `students.student_code`
- `students.pin_hash`
- `students.pin_salt`
- `students.recovery_hash`
- `guardians`
- `guardian_students`
- `sessions`
- `link_codes`
- `auth_failures`
- supporting indexes

Must verify against the real existing D1 database before marking complete.

### Student registration / login
Need production proof for:
- ID availability responds correctly,
- new chosen ID is persisted uniquely,
- six-digit PIN registration/login works,
- duplicate ID is rejected,
- wrong PIN increments failure tracking,
- lockout activates and later clears,
- logout/revocation works.

### Shared-device profile switching
Need manual test with at least two students on the same browser/device:
- select profile -> PIN -> correct student state,
- switch user -> prior session locked,
- second student's records remain separate,
- remove profile locally does not delete D1 data.

### Parent / guardian portal
Need production proof for:
- guardian registration/login,
- Parent Code return,
- Link Code generation/expiry/one-time use,
- guardian sees only linked children,
- parent-created child auto-links,
- child PIN reset revokes child sessions,
- unlink preserves student progress.

### Persistent learning state
Frontend source now uses authenticated D1 APIs, but end-to-end verification is still required for:
- checklist write/read,
- quiz attempt + wrong-answer mistake,
- XP/stars update,
- DLP language update,
- mistake mastered state,
- reload/cross-device persistence.

### PWA cache
Service-worker source now bypasses `/api/*` and uses network-first navigation. Verify on a real browser after deploy/update.

## Known next safe steps
1. Confirm Cloudflare has deployed current `main`.
2. Verify `/api/health` reports `schemaVersion: 2`.
3. Verify `/api/auth/student-id-availability?id=testmatrix`.
4. Manually register one learner through the live UI and confirm logout/login/state persistence.
5. Test two learner profiles on one device.
6. Register a guardian, generate child Link Code, link child and confirm dashboard isolation.
7. Only then record those runtime behaviours in `CHANGELOG.md` as fully verified.
8. Separately continue `0com.my` activation and connect `matrix.0com.my`.

## Security notes
- Never commit Cloudflare build tokens, API tokens, OpenAI keys or credentials.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is login identity, not database ownership key.
- Same-device presence is never sufficient evidence of guardianship.
- Raw remembered profile metadata must not contain bearer tokens.
