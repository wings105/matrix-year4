# MATRIX Tahun 4

Interactive Year 4 MATRIX Learning App for holiday revision and October exam preparation.

## AI / developer: read this first
Before editing this repository, read **`AGENTS.md`**. It defines the mandatory workflow for planning, verification, changelog updates and AI handoff.

Project documentation:
- `AGENTS.md` — mandatory rules for every AI/developer
- `docs/CURRENT_STATE.md` — verified vs pending current state
- `docs/PROJECT_PLAN.md` — roadmap and milestones
- `CHANGELOG.md` — verified changes only
- `docs/DECISIONS.md` — architecture/product decisions
- `docs/AI_HANDOFF.md` — current cross-model handoff and next safe step
- `CLAUDE.md` and `.github/copilot-instructions.md` — entrypoints for other AI tools

## Product direction
- Day 1–Day 8 holiday planner and daily checklist
- Mathematics DLP and Science DLP in BM + English
- Bahasa Melayu and English learning activities
- XP, stars and streak tracking
- Buku Silap Saya and green/yellow/red mastery
- Parent Area separated from child learning flow
- PWA/browser-first for Android Add to Home Screen
- October MATRIX exam preparation as the next learning phase

## Current architecture
`GitHub -> Cloudflare Workers (static assets + API) -> Cloudflare D1 -> custom domain`

Key files:
- `index.html` — current frontend PWA prototype
- `manifest.json` — PWA manifest
- `sw.js` — service worker/offline behaviour
- `src/index.js` — Cloudflare Worker API/runtime
- `wrangler.jsonc` — Cloudflare Worker + D1 configuration
- `db/schema.sql` — D1 application schema

## Current verified deployment
- Worker URL: `https://matrix-year4.msg-ebye.workers.dev/`
- D1 database: `matrix-year4-db`
- D1 binding: `DB`
- `/api/health` has been verified with database connected and schema ready.

For exact current status and pending items, always use `docs/CURRENT_STATE.md` rather than relying on this README or prior chat history.
