# DECISIONS — MATRIX Tahun 4

Record important decisions here so another AI does not reverse direction accidentally.

## ADR-001 — GitHub is the source of truth
**Status:** Accepted

All project code and durable project documentation live in `wings105/matrix-year4`. Chat history is supporting context only, not the authoritative state.

## ADR-002 — Cloudflare Workers + D1 is the primary backend
**Status:** Accepted

Use Cloudflare Workers for application/API runtime and Cloudflare D1 for persisted learning data. Do not introduce Supabase/Firebase/Railway by default.

## ADR-003 — PWA first, native Android later only if needed
**Status:** Accepted

The first installable experience is a browser PWA using Android Add to Home Screen. Native APK/Play Store packaging is a later option.

## ADR-004 — Mobile-first child experience
**Status:** Accepted

The child UI must be colourful, simple, touch-friendly and mission-oriented. Parent information is a separate flow.

## ADR-005 — Mathematics and Science are DLP / bilingual
**Status:** Accepted

Math and Science learning content should support BM + English.

## ADR-006 — Mistake-driven revision
**Status:** Accepted

Wrong answers feed `Buku Silap Saya`; mastery should use green/yellow/red rather than only a raw score.

## ADR-007 — Verified-only changelog policy
**Status:** Accepted

`CHANGELOG.md` is a record of verified changes, not intentions. Planned or unverified work belongs in `docs/PROJECT_PLAN.md` or `docs/CURRENT_STATE.md`.

## ADR-008 — No secrets in repository
**Status:** Accepted

Cloudflare tokens, API keys, passwords, PINs and recovery codes must never be committed. Store only safe configuration in Git.

## ADR-009 — Shared devices support multiple independent learner profiles
**Status:** Accepted

A phone/tablet/browser may remember several student profiles and allow switching between them.

Rules:
- Every learner remains a separate D1 identity keyed by immutable internal `student_id`.
- A profile switch locks/revokes the active learner session before another learner starts.
- Selecting a remembered learner requires that learner's PIN.
- Removing a remembered profile from a device does not delete the learner account or progress.
- The device itself is not an identity or ownership boundary.

## ADR-010 — Device membership does not imply parent/guardian relationship
**Status:** Accepted

Parent access is based on an explicit guardian-child relation in D1, not on which profiles are present on the same browser/device.

Rules:
- Parent/guardian has a separate `guardian_id`.
- A guardian may link to several children.
- A child may later link to more than one guardian.
- Existing child linking requires explicit one-time linking evidence.
- Unlinking removes guardian access only and does not delete the child's records.

## ADR-011 — Parent portal uses explicit guardian identity
**Status:** Accepted

Parent Area authenticates as a guardian account separate from student credentials. First release uses generated Parent Code + six-digit parent PIN.

Parent portal reads student data only through guardian-child link records.

## ADR-012 — Student chooses the public Student ID
**Status:** Accepted

This supersedes the earlier plan to generate the human-facing student code automatically.

Registration fields:
1. `Nama`
2. `ID pelajar`
3. `PIN / Password` with note `6 digit number`

Rules:
- The learner/parent chooses the public Student ID.
- The frontend automatically checks availability after typing stops.
- Current ID format is normalized lowercase, 3–20 characters, using letters, numbers, `-` or `_`.
- Public Student ID is used for login and remembered device profile display.
- Public Student ID is **not** the database primary key.
- Backend still generates an immutable UUID `student_id`; all learning records and guardian links use this internal UUID.
- Changing a display name or resetting a PIN must never change internal `student_id` or lose history.

Reason: a self-chosen ID is easier for a child to remember while the internal UUID preserves stable database relationships.

## ADR-013 — Remember profile metadata locally, keep active token session-scoped
**Status:** Accepted

For the shared-device first release:
- Local remembered learner profile stores only display name + public Student ID.
- Local remembered guardian profile stores only display name + Parent Code.
- Raw bearer tokens are not stored in the remembered profile list.
- The active bearer token is stored only in `sessionStorage` and is also represented server-side by a SHA-256 token hash with expiry/revocation.
- Switching user calls logout/revocation and requires PIN again for the next actor.

Reason: supports convenient shared-device switching without treating local profile metadata as proof of authentication.

## ADR-014 — Parent-child linking uses one-time Link Code
**Status:** Accepted

For an existing student account:
- Student generates a six-digit Link Code.
- Code expires after 10 minutes and becomes unusable after successful linking.
- Guardian must already be authenticated separately.
- Successful code validation creates `guardian_students`.
- Same-device presence is never sufficient for linking.

A child created by an authenticated guardian inside Parent Area may be linked automatically.

## Adding or changing a decision
For a new architectural/product decision:
1. Add a new ADR entry instead of silently changing an older rationale.
2. Mark the old decision `Superseded` if necessary.
3. Explain why the direction changed.
4. Update project plan/current state after implementation is verified.
