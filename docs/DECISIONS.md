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

## Adding or changing a decision
For a new architectural/product decision:
1. Add a new ADR entry instead of silently changing an older rationale.
2. Mark the old decision `Superseded` if necessary.
3. Explain why the direction changed.
4. Update project plan/current state after implementation is verified.
