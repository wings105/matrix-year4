# CURRENT STATE — MATRIX Tahun 4

Last updated: 2026-08-30

This document separates verified facts from pending/unverified work. Update it whenever meaningful state changes.

## VERIFIED

### Repository
- Repository: `wings105/matrix-year4`.
- Production branch: `main`.
- Repository contains the PWA frontend, Worker source, Wrangler config and D1 schema.

### Cloudflare deployment
- Current live Worker URL: `https://matrix-year4.msg-ebye.workers.dev/`.
- Static frontend has been successfully deployed through Cloudflare Workers.
- Worker API is reachable.

### D1
- Database name: `matrix-year4-db`.
- Worker binding: `DB`.
- `/api/health` has been manually verified returning:
  - `ok: true`
  - `database: connected`
  - `schema: ready`
  - `tables: 6`
- Repository schema defines the application tables:
  - `students`
  - `daily_progress`
  - `quiz_attempts`
  - `mistakes`
  - `student_stats`

### PWA prototype
- Day 1–Day 8 planner/checklist UI exists.
- Mathematics DLP, Science DLP, BM and English quiz prototype exists.
- XP, stars, streak, Buku Silap Saya and Parent Area UI exist.
- Prototype still has browser/local state behaviour in the frontend.

## PENDING / NOT YET VERIFIED

### Student registration / authentication
- Registration/authentication is NOT implemented yet.
- Planned child-first registration does not require child email or phone.
- Planned identity is: display name + generated `student_code` + 6-digit student PIN.
- Planned Parent Area uses a separate parent/admin PIN and parent recovery code.
- Plain PINs must never be stored; only salted derived hashes and secure session-token hashes should be persisted.
- Planned cross-device login uses `student_code + PIN`, while trusted devices may retain a secure session.
- All learning records must continue to use immutable `student_id` as the database key so a PIN reset or display-name change does not lose progress.
- Rate limiting / temporary lockout must be added before PIN login is considered secure enough for use.

### Custom domain
- Intended zone: `0com.my`.
- Intended app hostname: `matrix.0com.my`.
- Exabytes nameservers were changed to Cloudflare assigned nameservers.
- Cloudflare zone activation is waiting for nameserver propagation.
- Worker has NOT yet been verified on `matrix.0com.my`.

### Backend persistence
- Worker source contains persistence API work for student state/progress/quiz/stats/mistakes.
- These endpoints have NOT yet been fully end-to-end verified in production.
- Frontend has NOT yet been verified as synchronized to D1.
- Do not state cross-device sync is complete until manually tested.

### PWA cache change
- Service worker source has been updated so `/api/*` requests should bypass static cache.
- This behaviour still requires a clean production/browser verification after the latest deployment.

## Known next safe steps
1. Wait for Cloudflare to mark `0com.my` Active.
2. Connect `matrix.0com.my` to Worker `matrix-year4`.
3. Verify app root and `/api/health` on the custom domain.
4. Implement and verify the child registration/authentication flow before calling D1 sync multi-device ready.
5. Test persistence API endpoints one at a time.
6. Wire frontend state to backend only after API verification.

## Security notes
- Never commit Cloudflare build tokens, API tokens, OpenAI keys or credentials.
- Never store student or parent PINs in plaintext.
- Numeric PIN login requires server-side rate limiting / lockout.
- The visible name/label of a Cloudflare build token is not a project secret and must not be used as proof of isolation or access scope.
- Secrets belong in Cloudflare environment/secrets configuration, not the repository.
