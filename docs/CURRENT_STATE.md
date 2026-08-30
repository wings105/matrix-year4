# CURRENT STATE — MATRIX Tahun 4

Last updated: 2026-08-30

This document separates verified repository facts from production/runtime verification. Do not call a feature shipped merely because source code exists.

## VERIFIED

### Repository / governance
- Repository: `wings105/matrix-year4`.
- Production branch: `main`.
- `AGENTS.md` is the mandatory AI/developer entry point.
- Project roadmap, decisions, current state, changelog and handoff documents exist.

### Previously verified Cloudflare / D1 baseline
- Worker URL: `https://matrix-year4.msg-ebye.workers.dev/`.
- D1 database: `matrix-year4-db`.
- D1 binding: `DB`.
- Before the authentication expansion, `/api/health` was manually verified with database connected and schema ready.
- Custom domain `matrix.0com.my` is still waiting on `0com.my` Cloudflare zone activation/nameserver propagation.

### Authentication/shared-device implementation exists in repository
The current source now contains:
- learner registration form: name + learner-chosen Student ID + six-digit PIN,
- debounced Student ID availability API/check,
- immutable internal student UUID separate from chosen public Student ID,
- PBKDF2-SHA256 PIN derivation with random salts,
- one-time recovery code hashing,
- student login/logout/session API,
- guardian registration/login/session API,
- server-side failed-login tracking and 10-minute lockout after five failures,
- shared-device remembered learner profile chooser,
- separate remembered Parent profiles,
- session-scoped active bearer token,
- guardian-child many-to-many linking,
- six-digit one-time parent Link Code,
- parent child-registration, linked-child list, child PIN reset and unlink operations,
- authenticated student checklist/quiz/stats/mistake state flow,
- manual legacy checklist import,
- service-worker API cache bypass and network-first navigation,
- repository verification script and GitHub Actions verification workflow.

Repository/source existence is verified only after the branch is merged to `main`; production behaviour must still be tested separately.

## PENDING / NOT YET VERIFIED IN PRODUCTION

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
1. Merge the completed auth/shared-device implementation to `main`.
2. Wait for Cloudflare Git deployment to finish.
3. Verify `/api/health` reports the new schema version.
4. Verify Student ID availability GET endpoint.
5. Manually register a test student through the UI and confirm login/state.
6. Test two learner profiles on one device.
7. Register a guardian, generate child Link Code, link child and confirm dashboard isolation.
8. Only then move these runtime items into `CHANGELOG.md` as fully verified features.
9. Separately continue `0com.my` activation and connect `matrix.0com.my`.

## Security notes
- Never commit Cloudflare build tokens, API tokens, OpenAI keys or credentials.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is login identity, not database ownership key.
- Same-device presence is never sufficient evidence of guardianship.
- Raw remembered profile metadata must not contain bearer tokens.
