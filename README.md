# MATRIX Tahun 4

Interactive Year 4 MATRIX Learning App for holiday revision and October exam preparation.

## Current prototype
- Day 1–Day 8 planner and daily checklist
- Mathematics DLP and Science DLP
- Bahasa Melayu and English quizzes
- XP, stars and streak tracking
- Buku Silap Saya
- Parent dashboard with PIN
- Local browser persistence
- Installable PWA structure

## Cloudflare-ready structure
- `index.html` — frontend PWA
- `manifest.json` — PWA manifest
- `sw.js` — offline service worker
- `functions/api/health.js` — Pages Functions backend health endpoint
- `db/schema.sql` — initial Cloudflare D1 schema

## Planned architecture
GitHub → Cloudflare Pages/Functions → Cloudflare D1 → custom domain → Android Add to Home Screen.

Backend database sync is intentionally not active until the Cloudflare D1 binding is created.
