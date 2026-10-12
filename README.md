# Oyesun landing · oyesun.fimolabs.com

Next.js (App Router, TypeScript), Tailwind, deployed on Vercel. Design reference: `design/oyesun-landing.dc.html` (prototype syntax, never shipped).

One origin holds everything: the landing page and the waitlist, signup and login, and the app itself, proxied in at `/app`. That is what lets a new account reach the app as a sessionStorage write rather than a token in a URL, and why there is no CORS anywhere.

| Path | What it is |
| --- | --- |
| `/` | landing page, reserve a username, check your spot, play the game |
| `/signup` | the four signup screens, plus the invite-code door |
| `/login` | username + password |
| `/admin` | approve the next N in line (needs `ADMIN_TOKEN`) |
| `/app/*` | the app, rewritten through to Cloud Run |
| `/api/*` | server-only route handlers |

## How someone gets in

Approval is the credential. Being marked `invited` on the waitlist is what lets an account be created — there is no code to copy, lose, or pass to someone else. The app's own invite codes are untouched and still run the viral loop.

1. They reserve a username on `/`. Nothing else is asked for.
2. Approve the next batch on `/admin`, in line order, so the game's jumps genuinely decide who is next.
3. They come back and type their username on `/signup`. **This is how most people find out they are in** — `notify_contact` is optional and most never leave one, so approval cannot rely on a message going out.
4. `approved` turns that page into a password field. `/api/auth/signup` takes the approval in Supabase (once, atomically), asks the app to create the account, and hands back a Firebase custom token.
5. The token goes into `sessionStorage` and the browser goes to `/app`, which reads it, deletes it, and signs in.

If the app fails at step 4, the approval is given back — nobody loses their place to our own error.

Still waiting instead? The same page shows their spot and today's Read the Room, so there is always something to do about it.

## Privacy rules for the waitlist
- Stored: username, line order, game jumps, last game date, status, and when they were approved and made an account.
- Never stored: phone, email, IP, device ID. IPs are only used for an in memory rate limit.
- `notify_contact` is saved only if someone types it into "Notify me". `/admin` shows it at the moment of approval and clears it with the "I've messaged them" button — a separate step on purpose, because a contact dropped before the message went out is a person who never hears from us.
- A recovery email given at signup goes to the app, not here, and is only ever used to reset a password.

## Supabase setup
1. supabase.com, New project, region Mumbai (ap-south-1). Save the database password.
2. SQL Editor, New query, paste all of `supabase/schema.sql`, Run.
3. Project Settings, API: copy the Project URL and the `service_role` secret key.
4. Vercel, oyesun project, Settings, Environment Variables, for Production, Preview and Development:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key
   Never prefix these with `NEXT_PUBLIC_`. Redeploy after adding them.
5. Local: copy `.env.example` to `.env.local` and fill in the same two values. `npm run dev`.

Three more are needed for signup and login, same places, same rule about `NEXT_PUBLIC_`:

| Name | What it is |
| --- | --- |
| `APP_ORIGIN` | the Cloud Run URL. Both the `/app` rewrite and the server-side calls point at it |
| `WAITLIST_BRIDGE_SECRET` | must match the same name on Cloud Run. It is what lets this site create an account with no invite code |
| `ADMIN_TOKEN` | guards `/admin` and the approval endpoints |

Without `APP_ORIGIN`, `/app` 404s and signup says it couldn't finish. Without `ADMIN_TOKEN`, `/admin` refuses every key.

## API (server only)
- `POST /api/reserve {username}` creates a spot, 409 if taken
- `GET /api/spot?u=` position, people ahead, status
- `POST /api/notify {username, contact}` optional contact for the invite message
- `GET /api/game?u=` 3 random Read the Room questions, no answers
- `POST /api/game/answer {username, questionId, choice}` +5 right, +2 close, -2 wrong, 10 spots a day max, one game a day

Accounts:
- `POST /api/auth/check {username}` → `new | waiting | approved | claimed`, with position
- `POST /api/auth/signup {username, password, email?}` the approved path → `custom_token`
- `POST /api/auth/signup-code {username, password, code, email?}` the invite-code path → `custom_token`
- `POST /api/auth/login {username, password}` → `custom_token`. Deliberately says nothing about the waitlist on failure: that would let anyone probe who is on it
- `GET /api/auth/available?u=` as-you-type check, for the invite-code path only

Admin, all requiring an `X-Admin-Token` header:
- `GET /api/admin/queue?n=` counts, who is next, who is approved but hasn't signed up
- `POST /api/admin/approve {count}` or `{usernames}` → who was approved, and their contacts
- `POST /api/admin/forget-contacts {usernames}` the only thing that deletes a contact

## Privacy and terms
Text lives in `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`. Update the privacy page before the chat product opens.

Until the Supabase env vars are set, the API routes answer "The waitlist opens very soon" instead of erroring.

## Migrations

`supabase/migrations/2026-10-07-line-offset-and-scoring.sql` was applied on
11 October 2026: the line starts at 100, and Read the Room scores +5 right,
+2 close, -2 wrong with a ceiling of 10 spots a day.

`supabase/migrations/2026-10-12-approval-and-signup.sql` was applied on
12 October 2026: `approved_at` and `account_created_at`, and the functions
behind `/signup` and `/admin`. `waitlist_claim` is the one that matters —
it succeeds exactly once per approval, so one approval can never become two
accounts.
