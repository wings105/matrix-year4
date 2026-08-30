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
- Student and guardian bearer sessions are stored server-side as token hashes with expiry/revocation.
- Five failed logins in the same actor-code/IP scope cause a 10-minute lockout.
- Shared-device learner chooser, switching and local-only profile removal exist.
- Guardian identity is separate from student identity.
- Many-to-many guardian-child links and one-time six-digit Link Codes exist.
- Parent Area source supports linked-child list, child registration/linking, PIN reset and unlink.
- Authenticated checklist, quiz, stats, mistakes and D1 state loading are wired in source.
- Service worker bypasses `/api/*` and uses network-first navigation.
- Repository verification is automated in GitHub Actions.

### Live Worker / D1 schema v2
- Cloudflare Workers Build for current `main` completed successfully.
- Live smoke tests run against `https://matrix-year4.msg-ebye.workers.dev`.
- Live `/api/health` returned `ok=true`, `database=connected`, `schema=ready`, `schemaVersion=2`, `tables=11`.
- Existing production D1 accepted the schema-v2 migration path.
- Live Student ID availability endpoint returned valid/available/normalized output for a CI-generated ID.

### Cloudflare zone and custom domain configuration
- `0com.my` nameservers were changed at the registrar to Cloudflare nameservers.
- Cloudflare now shows the `0com.my` zone as active/protected.
- Owner chose `school.0com.my` as the production hostname instead of the earlier planned `matrix.0com.my`.
- Cloudflare Worker Domains UI shows `school.0com.my` attached to Worker `matrix-year4` with Environment `Production` and Zone `0com.my`.

## PENDING / NOT YET FULLY VERIFIED END-TO-END

### Custom-domain runtime
Need real runtime proof for:
- `https://school.0com.my/` resolves and loads the current PWA,
- `https://school.0com.my/api/health` returns expected schema-v2 health,
- HTTPS certificate is valid,
- phone/PWA install behaviour works on the custom hostname.

### Student registration / login writes
Need production proof for POST/session behaviour:
- new chosen ID persists uniquely,
- six-digit PIN registration/login works,
- expected student + stats rows are created,
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
Need real authenticated end-to-end tests for checklist, quiz/mistakes, XP/stars, DLP language, mistake mastery, reload and cross-device persistence.

## Known next safe steps
1. Open `https://school.0com.my/` in a normal browser and confirm the current learner/profile UI loads.
2. Open `https://school.0com.my/api/health` and confirm schema v2/11 tables.
3. Then register one learner using name + chosen available Student ID + six-digit PIN.
4. Verify logout/login and cloud state persistence.
5. Add a second learner and test shared-device isolation.
6. Test Parent Area linking.
7. Record only behaviours actually proven in `CHANGELOG.md`.

## Security notes
- Never commit Cloudflare/API tokens, credentials, PINs or recovery codes.
- Never store student/parent PINs or recovery codes in plaintext.
- Public Student ID is a login identity, not a database ownership key.
- Same-device presence is never proof of guardianship.
- Remembered profile metadata must not contain bearer tokens.
