# AI DEVELOPMENT RULES — MATRIX Tahun 4

This file is the mandatory entry point for any AI model or developer editing this repository.

## 1. Read before editing
Before changing any file, read in this order:
1. `AGENTS.md`
2. `docs/CURRENT_STATE.md`
3. `docs/PROJECT_PLAN.md`
4. `CHANGELOG.md`
5. `docs/DECISIONS.md`
6. Relevant source files for the task

Do not assume the repository still matches prior chat memory. The repository and verified production state are the source of truth.

## 2. Project direction
MATRIX Tahun 4 is a mobile-first PWA for a Year 4 student preparing for the October MATRIX examination.

Core product rules:
- Day 1–Day 8 holiday learning plan is the first learning cycle.
- Mathematics and Science use DLP / bilingual BM + English.
- BM, English and other Year 4 subjects follow the planned KPM-aligned revision scope.
- The app should be child-friendly, colourful, interactive, simple and usable independently.
- Parent-facing information must be separated from the child learning flow.
- PWA/browser-first; Android installation is via Add to Home Screen before considering a native APK.

## 3. Architecture rules
Current intended architecture:
`GitHub -> Cloudflare Workers (static assets + API) -> Cloudflare D1 -> custom domain`

Rules:
- GitHub `main` is the production source of truth.
- Cloudflare D1 binding name is `DB`.
- Keep secrets/tokens out of Git. Never commit Cloudflare tokens, OpenAI keys, passwords, PIN secrets or private credentials.
- Prefer small, reversible changes. Do not replace the architecture without recording an approved decision in `docs/DECISIONS.md`.
- Do not add Supabase, Firebase or another backend unless the architecture decision is explicitly changed and documented.

## 4. Planning vs verified changes
Never mix planned work with completed work.

Use:
- `docs/PROJECT_PLAN.md` for planned / in-progress work.
- `docs/CURRENT_STATE.md` for the latest known state, clearly separated into VERIFIED and PENDING.
- `CHANGELOG.md` only for changes that have been verified.
- `docs/DECISIONS.md` for architecture/product decisions and their reasons.

### A change is allowed into CHANGELOG only after verification
Acceptable evidence includes one or more of:
- repository file/commit confirmed,
- automated test passed,
- Cloudflare build/deploy succeeded,
- API endpoint returned the expected result,
- UI behaviour was manually confirmed,
- D1 data/schema was queried and confirmed.

If verification is not possible, write it as `PENDING VERIFICATION` in `docs/CURRENT_STATE.md`; do NOT write it as shipped in `CHANGELOG.md`.

## 5. Required workflow for every meaningful change
1. Read project docs and inspect current code.
2. Identify affected files and current behaviour.
3. Record or update the plan if scope is meaningful.
4. Implement the smallest safe change.
5. Verify the actual result.
6. Only after verification:
   - update `CHANGELOG.md`,
   - update `docs/CURRENT_STATE.md`,
   - update `docs/PROJECT_PLAN.md` if a milestone moved,
   - update `docs/DECISIONS.md` if a decision changed.
7. Commit with a descriptive message.
8. Leave the repository in a state another AI can understand without chat history.

## 6. Verification notes
When recording a verified change, include enough evidence to reproduce confidence, for example:
- endpoint: `/api/health`
- expected result: `ok=true`, `database=connected`, `schema=ready`
- deployment: Cloudflare build success
- commit SHA when useful

Do not fabricate test results or deployment status.

## 7. Data and migration safety
- Never delete D1 tables/data casually.
- Schema changes must be backward-compatible when possible.
- For destructive migrations, document backup/rollback steps first.
- Browser `localStorage` data may exist from the prototype; migration to D1 must avoid silently losing user progress.

## 8. UI/product guardrails
- Mobile-first and touch-friendly.
- Keep a colourful child-friendly visual language.
- Avoid clutter and long walls of text in the child UI.
- DLP content must preserve BM + English meaning accurately.
- Wrong answers should support learning, not only mark failure; route mistakes into `Buku Silap Saya` where applicable.
- Progress should be understandable using XP/stars/streak plus mastery colours (green/yellow/red).

## 9. Handoff rule
Before ending a development session, update `docs/AI_HANDOFF.md` with:
- what was requested,
- what actually changed,
- what was verified,
- what remains pending,
- the exact next safe step.

If nothing was verified, say so explicitly.
