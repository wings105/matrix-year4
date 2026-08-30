# CURRENT STATE — MATRIX Tahun 4

Last updated: 2026-08-30

This document separates verified repository facts from production/runtime verification. Do not call a feature shipped merely because source code exists.

## VERIFIED

### Repository / governance
- Repository: `wings105/matrix-year4`.
- Production branch: `main`.
- `AGENTS.md` is the mandatory AI/developer entry point.
- Project roadmap, decisions, current state, changelog and handoff documents exist.

### Authentication/shared-device implementation is on `main`
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

**Verification:** feature branch CI passed, the implementation was fast-forwarded into `main`, and subsequent `main` repository verification runs completed successfully.

### Live Cloudflare Worker / D1 schema v2
- Cloudflare Workers Build for current `main` completed successfully.
- Automated `live-smoke` runs against `https://matrix-year4.msg-ebye.workers.dev` from GitHub Actions.
- Live `/api/health` returned:
  - `ok: true`
  - `database: connected`
  - `schema: ready`
  - `schemaVersion: 2`
  - `tables: 11`
- This confirms the existing D1 database accepted the schema-v2 initialization/migration path without breaking health.

### Live Student ID availability endpoint
- Live `GET /api/auth/student-id-availability` was tested with a unique CI-generated learner ID.
- Response returned `ok=true`, `valid=true`, `available=true` and a normalized ID.
- Main CI now repeats the health/schema and ID-availability smoke checks after every `main` push.

### Previously verified infrastructure baseline
- D1 database: `matrix-year4-db`.
- D1 binding: `DB`.
- Custom domain `matrix.0com.my` is still waiting on `0com.my` Cloudflare zone activation/nameserver propagation.

## PENDING / NOT YET FULLY VERIFIED END-TO-END

### Student registration / login writes
Need production proof for POST/session behaviour:
- new chosen ID is persisted uniquely,
- six-digit PIN registration/login works,
- expected student + stats rows are created,
- duplicate Student ID returns a conflict,
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
Frontend source uses authenticated D1 APIs, but end-to-end verification is still required for:
- checklist write/read,
- quiz attempt + wrong-answer mistake,
- XP/stars update,
- DLP language update,
- mistake mastered state,
- reload/cross-device persistence.

### PWA cache/user-visible update
Service-worker source bypasses `/api/*` and uses network-first navigation. Repository checks pass; verify actual phone/browser behaviour during learner registration test.

## Known next safe steps
1. Manually open the live app and register one learner using name + chosen available Student ID + six-digit PIN.
2. Confirm logout/login and cloud state persistence for that learner.
3. Add a second learner on the same device and verify isolation.
4. Register a guardian, generate child Link Code, link child and confirm dashboard isolation.
5. Record only proven POST/session/shared-device/guardian behaviour in `CHANGELOG.md`.
6. Separately continue `0com.my` activation and connect `matrix.0com.my`.

## Security notes
- Never commit Cloudflare build tokens, API tokens, OpenAI keys or credentials.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is login identity, not database ownership key.
- Same-device presence is never sufficient evidence of guardianship.
- Raw remembered profile metadata must not contain bearer tokens.
