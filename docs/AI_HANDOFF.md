# AI HANDOFF — MATRIX Tahun 4

Last updated: 2026-08-30

Use this file as the short operational handoff between AI models or development sessions.

## Current request / direction
Create a maintainable interactive Year 4 learning PWA from the existing Day 1–Day 8 holiday plan, with DLP Mathematics and Science, daily checklist, quizzes, progress, Buku Silap Saya, parent view and later MATRIX exam preparation.

## What is already verified
- GitHub repository exists and `main` is production source.
- Cloudflare Worker deployment is live at `https://matrix-year4.msg-ebye.workers.dev/`.
- Cloudflare D1 `matrix-year4-db` is bound as `DB`.
- `/api/health` was manually verified with `ok=true`, `database=connected`, `schema=ready`, `tables=6`.
- Core prototype UI exists for Day 1–Day 8, quizzes, rewards, Buku Silap and Parent Area.

## What changed recently but is still pending full verification
- Worker persistence APIs were added for state/progress/quiz/stats/mistakes.
- Service worker was changed so `/api/*` should bypass cache.
- These changes should not be called fully shipped until endpoint/browser tests confirm them.

## Infrastructure currently waiting on user/provider
- `0com.my` is being moved to Cloudflare nameservers.
- Intended hostname is `matrix.0com.my`.
- Wait for Cloudflare zone status `Active` before connecting the custom domain.

## Exact next safe step
1. Confirm `0com.my` becomes Active in Cloudflare.
2. Connect `matrix.0com.my` to Worker `matrix-year4`.
3. Test both:
   - `https://matrix.0com.my/`
   - `https://matrix.0com.my/api/health`
4. Record custom-domain success in `CHANGELOG.md` only after both tests pass.

## Handoff completion template
At the end of any meaningful AI development session, replace/add a short section containing:
- Request:
- Files changed:
- Verification performed:
- Verified result:
- Pending / risk:
- Next safe step:

Never claim a production result that was not actually tested.
