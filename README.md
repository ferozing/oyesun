# Oyesun landing · oyesun.fimolabs.com

Next.js (App Router, TypeScript), Tailwind, deployed on Vercel. Design reference: `design/oyesun-landing.dc.html` (prototype syntax, never shipped).

## Privacy rules for the waitlist
- Stored: username, line order, game jumps, last game date, status.
- Never stored: phone, email, IP, device ID. IPs are only used for an in memory rate limit.
- `notify_contact` is saved only if someone types it into "Notify me". Clear it after the invite goes out with
  `select public.waitlist_invite('username');` (sets status to invited and the contact to null).

## Supabase setup
1. supabase.com, New project, region Mumbai (ap-south-1). Save the database password.
2. SQL Editor, New query, paste all of `supabase/schema.sql`, Run.
3. Project Settings, API: copy the Project URL and the `service_role` secret key.
4. Vercel, oyesun project, Settings, Environment Variables, for Production, Preview and Development:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key
   Never prefix these with `NEXT_PUBLIC_`. Redeploy after adding them.
5. Local: copy `.env.example` to `.env.local` and fill in the same two values. `npm run dev`.

## API (server only)
- `POST /api/reserve {username}` creates a spot, 409 if taken
- `GET /api/spot?u=` position, people ahead, status
- `POST /api/notify {username, contact}` optional contact for the invite message
- `GET /api/game?u=` 3 random Read the Room questions, no answers
- `POST /api/game/answer {username, questionId, choice}` +5 right, +2 wrong, 15 jumps a day max, one game a day

## Privacy and terms
Text lives in `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`. Update the privacy page before the chat product opens.

Until the Supabase env vars are set, the API routes answer "The waitlist opens very soon" instead of erroring.

## Pending migration

`supabase/migrations/2026-10-07-line-offset-and-scoring.sql` has not been applied
yet. Run it once in the Supabase SQL editor. Until then the site works, but the
line does not start at 100 and wrong answers cost nothing.
