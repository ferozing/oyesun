-- Approval and signup. Run once in the Supabase SQL editor.
-- Folded into schema.sql as well, so a fresh project gets it from the start.
--
-- Approval is the credential: being marked 'invited' here is what lets someone
-- create an account, so there is no code to copy, lose or pass on. The invite
-- code path in the app stays exactly as it was, for the viral loop.
--
-- Privacy is unchanged. Two timestamps are added and nothing else. Still no
-- phone, no email, no IP, no device id. notify_contact is still only ever set
-- by someone typing it into "Notify me", and is now cleared explicitly by
-- waitlist_forget_contacts once the message has actually gone out.

alter table public.waitlist
  add column if not exists approved_at        timestamptz,
  add column if not exists account_created_at timestamptz;

-- The approved-but-not-signed-up set is the one the admin page reads on every
-- load and the one that should stay small, so it gets its own partial index.
create index if not exists waitlist_approved_idx
  on public.waitlist (approved_at)
  where status = 'invited' and account_created_at is null;


-- One round trip for the signup form: which of the four screens to show, plus
-- the numbers the "still waiting" screen needs to draw the line.
--   'new'       no such username  -> offer to reserve a spot
--   'waiting'   in line           -> show the spot and today's game
--   'approved'  approved, unused  -> show the password field
--   'claimed'   account exists    -> send them to log in
-- The left joins are what let one query answer for a username that isn't in
-- the table at all: waitlist_spot returns no rows then, not a null row.
create or replace function public.waitlist_signup_state(p_username text)
returns table (out_state text, out_position bigint, out_ahead bigint, out_total bigint)
language sql stable as $$
  select
    case
      when w.username is null               then 'new'
      when w.account_created_at is not null  then 'claimed'
      when w.status = 'invited'              then 'approved'
      else 'waiting'
    end,
    s.out_position,
    s.out_ahead,
    -- The total has to be the same number every other screen shows, and
    -- waitlist_spot is the only thing that knows how it is presented: the line
    -- starts at waitlist_offset(), so first in line reads as #101. For a
    -- username with no row there is nothing to ask it about, so borrow any
    -- waiting person's total — same function, same offset — rather than
    -- counting rows here and disagreeing with the rest of the site. The bare
    -- count is only ever reached when the line is empty.
    coalesce(
      s.out_total,
      (select t.out_total
         from public.waitlist w2
         cross join lateral public.waitlist_spot(w2.username) t
        where w2.status = 'waiting'
        limit 1),
      (select count(*) from public.waitlist where status = 'waiting')
    )
  from (select 1) base
  left join public.waitlist w on w.username = p_username
  left join lateral public.waitlist_spot(p_username) s on true
$$;


-- Takes the approval. Only the first caller for a given username gets true, so
-- a double submit, two tabs, or a retry after a slow response can never turn
-- one approval into two accounts.
create or replace function public.waitlist_claim(p_username text)
returns boolean language sql as $$
  with claimed as (
    update public.waitlist
       set account_created_at = now()
     where username = p_username
       and status = 'invited'
       and account_created_at is null
    returning 1
  )
  select exists (select 1 from claimed)
$$;

-- Gives the approval back when the account creation it was taken for failed
-- (the app was down, the username had been taken in the meantime), so the
-- person can just try again instead of being locked out by our own error.
create or replace function public.waitlist_unclaim(p_username text)
returns void language sql as $$
  update public.waitlist set account_created_at = null where username = p_username
$$;


-- Approves the next p_count people in line order. Deliberately the same
-- (created_seq - jumps) ordering the line itself uses, so the game jumps
-- genuinely decide who gets in next rather than being decoration.
--
-- Returns the contact each person left, if any, so the ones who can be
-- messaged get messaged. It does NOT clear those contacts: a contact dropped
-- before the message actually went out is a person who never hears from us.
-- Clear them with waitlist_forget_contacts afterwards.
create or replace function public.waitlist_approve_next(p_count integer default 10)
returns table (out_username text, out_contact text)
language sql as $$
  with next_up as (
    select username
      from public.waitlist
     where status = 'waiting'
     order by (created_seq - jumps), created_seq
     limit greatest(0, least(p_count, 200))
     for update
  )
  update public.waitlist w
     set status = 'invited', approved_at = now()
    from next_up n
   where w.username = n.username
  returning w.username, w.notify_contact
$$;

-- Approve specific people by name, for when the next-in-line order isn't what
-- you want (a friend, a tester, someone whose username collided).
create or replace function public.waitlist_approve(p_usernames text[])
returns table (out_username text, out_contact text)
language sql as $$
  update public.waitlist
     set status = 'invited', approved_at = now()
   where username = any (p_usernames)
     and status = 'waiting'
  returning username, notify_contact
$$;

-- Run once the invite messages have gone out. This is the only thing that ever
-- removes a contact, and it is a separate step on purpose.
create or replace function public.waitlist_forget_contacts(p_usernames text[])
returns integer language sql as $$
  with cleared as (
    update public.waitlist
       set notify_contact = null
     where username = any (p_usernames)
       and notify_contact is not null
    returning 1
  )
  select count(*)::integer from cleared
$$;


-- What the admin page shows before you press anything: the four counts, and
-- who is actually next. contact_on_file is a boolean, not the contact itself,
-- so the queue can be reviewed without putting anyone's contact on screen.
create or replace function public.waitlist_admin_summary()
returns table (out_waiting bigint, out_approved_unclaimed bigint, out_accounts bigint, out_total bigint)
language sql stable as $$
  select
    count(*) filter (where status = 'waiting'),
    count(*) filter (where status = 'invited' and account_created_at is null),
    count(*) filter (where account_created_at is not null),
    count(*)
  from public.waitlist
$$;

create or replace function public.waitlist_next_in_line(p_count integer default 10)
returns table (out_username text, out_jumps integer, out_contact_on_file boolean)
language sql stable as $$
  select username, jumps, notify_contact is not null
    from public.waitlist
   where status = 'waiting'
   order by (created_seq - jumps), created_seq
   limit greatest(0, least(p_count, 200))
$$;

-- Approved a while ago and still no account: who to nudge, oldest first.
create or replace function public.waitlist_approved_pending()
returns table (out_username text, out_approved_at timestamptz, out_contact text)
language sql stable as $$
  select username, approved_at, notify_contact
    from public.waitlist
   where status = 'invited' and account_created_at is null
   order by approved_at nulls last
$$;


-- Same discipline as schema.sql: nothing reachable by anon or authenticated.
-- Only the API routes, holding the service role key, can call any of this.
revoke all on function
  public.waitlist_signup_state(text),
  public.waitlist_claim(text),
  public.waitlist_unclaim(text),
  public.waitlist_approve_next(integer),
  public.waitlist_approve(text[]),
  public.waitlist_forget_contacts(text[]),
  public.waitlist_admin_summary(),
  public.waitlist_next_in_line(integer),
  public.waitlist_approved_pending()
  from public, anon, authenticated;

grant execute on function
  public.waitlist_signup_state(text),
  public.waitlist_claim(text),
  public.waitlist_unclaim(text),
  public.waitlist_approve_next(integer),
  public.waitlist_approve(text[]),
  public.waitlist_forget_contacts(text[]),
  public.waitlist_admin_summary(),
  public.waitlist_next_in_line(integer),
  public.waitlist_approved_pending()
  to service_role;
