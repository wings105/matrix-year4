# DECISIONS — MATRIX Tahun 4

Record important decisions here so another AI does not reverse direction accidentally.

## ADR-001 — GitHub is the source of truth
**Status:** Accepted

All project code and durable project documentation live in `wings105/matrix-year4`. Chat history is supporting context only, not the authoritative state.

## ADR-002 — Cloudflare Workers + D1 is the primary backend
**Status:** Accepted

Use Cloudflare Workers for application/API runtime and Cloudflare D1 for persisted learning data. Do not introduce Supabase/Firebase/Railway by default.

Reason: keeps frontend, API and SQL data in one simple deployment stack for this single-student-first application.

## ADR-003 — PWA first, native Android later only if needed
**Status:** Accepted

The first installable experience is a browser PWA using Android Add to Home Screen. Native APK/Play Store packaging is a later option, not a current requirement.

## ADR-004 — Mobile-first child experience
**Status:** Accepted

The child UI must be colourful, simple, touch-friendly and mission-oriented. Parent information is a separate flow to avoid cluttering the learning experience.

## ADR-005 — Mathematics and Science are DLP / bilingual
**Status:** Accepted

Math and Science learning content should support BM + English, with the ability to expose English terminology while preserving Malay understanding.

## ADR-006 — Mistake-driven revision
**Status:** Accepted

Wrong answers should feed `Buku Silap Saya` and future revision. The system should distinguish mastery using green/yellow/red rather than only showing a raw score.

## ADR-007 — Verified-only changelog policy
**Status:** Accepted

`CHANGELOG.md` is a record of verified changes, not intentions. Planned or unverified work belongs in `docs/PROJECT_PLAN.md` or `docs/CURRENT_STATE.md`.

A change is considered verified when there is concrete evidence such as a repository commit/file, successful deployment/test, confirmed API response, confirmed UI behaviour or confirmed database result.

## ADR-008 — No secrets in repository
**Status:** Accepted

Cloudflare tokens, API keys, passwords and credentials must never be committed. Use provider secret/environment configuration.

## ADR-009 — Shared devices support multiple independent learner profiles
**Status:** Accepted

A phone/tablet/browser may remember several student profiles and allow the user to switch between them.

Rules:
- Every learner remains a separate D1 identity keyed by immutable `student_id`.
- A profile switch must lock/end the current learner session before another learner starts.
- Selecting a remembered learner requires that learner's PIN unless a future parent-approved trusted-device policy explicitly relaxes it.
- Removing a remembered profile from a device does not delete the learner account or progress.
- The device itself is not an identity or ownership boundary; using the same device must never merge progress between students.

Reason: siblings and friends may legitimately share one phone, and their learning history must remain fully separated.

## ADR-010 — Device membership does not imply parent/guardian relationship
**Status:** Accepted

Parent access is based on an explicit guardian-child relation in D1, not on which profiles are present on the same browser/device.

Rules:
- Parent/guardian has a separate `guardian_id` identity.
- A guardian may link to several children.
- A child may later link to more than one guardian.
- If a parent creates a child from Parent Area, the link may be automatic.
- Linking an already-existing child requires explicit one-time approval/linking evidence.
- A friend's student profile added to a shared phone must not appear in the phone owner's Parent Area unless deliberately linked.
- Unlinking removes guardian access only and does not delete the child's records.

Reason: prevents accidental or unauthorized visibility of another child's learning data.

## ADR-011 — Parent portal uses explicit guardian identity, not the child's login
**Status:** Accepted

Parent Area must authenticate as a guardian account separate from student credentials. First release may use generated `parent_code` plus parent PIN/passcode with optional recovery contact later.

Parent portal reads student data only through guardian-child link records. Parent actions such as child PIN reset must preserve the child's immutable `student_id` and learning history.

## Adding or changing a decision
For a new architectural/product decision:
1. Add a new ADR entry instead of silently changing an older rationale.
2. Mark the old decision `Superseded` if necessary.
3. Explain why the direction changed.
4. Update project plan/current state after implementation is verified.
