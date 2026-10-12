-- Oyesun waitlist. Run this once in the Supabase SQL editor.
-- Privacy: no phone, email, IP or device ID is stored. notify_contact is only
-- set when someone types it into the optional "Notify me" field.

create table if not exists public.waitlist (
  username        text primary key check (username ~ '^[a-z0-9_]{3,20}$'),
  created_seq     bigserial not null unique,
  jumps           integer not null default 0 check (jumps >= 0),
  last_played_on  date,
  status          text not null default 'waiting' check (status in ('waiting', 'invited')),
  notify_contact  text check (notify_contact is null or char_length(notify_contact) between 3 and 120),
  created_at      timestamptz not null default now(),
  -- Today's Read the Room game, so answers can be checked once each on the server.
  game_qids       integer[] not null default '{}',
  game_answered   integer[] not null default '{}',
  game_jumps      integer not null default 0 check (game_jumps between 0 and 10),
  -- Approval and signup. approved_at is when they were let in;
  -- account_created_at is when they used that approval to make an account, and
  -- is what stops one approval becoming two accounts.
  approved_at         timestamptz,
  account_created_at  timestamptz
);

create index if not exists waitlist_line_idx
  on public.waitlist ((created_seq - jumps), created_seq)
  where status = 'waiting';

-- The approved-but-not-signed-up set: read on every admin page load, and the
-- one that should always stay small.
create index if not exists waitlist_approved_idx
  on public.waitlist (approved_at)
  where status = 'invited' and account_created_at is null;

-- Row Level Security on, with no policies: the anon and authenticated roles
-- can never read or write. Only the API routes, using the service role key, touch it.
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
revoke all on sequence public.waitlist_created_seq_seq from anon, authenticated;
grant select, insert, update on public.waitlist to service_role;
grant usage, select on sequence public.waitlist_created_seq_seq to service_role;

-- Today's date in India, used for "one game per day".
create or replace function public.waitlist_today() returns date
language sql stable as $$ select (now() at time zone 'Asia/Kolkata')::date $$;

-- Where the line starts counting: the first person to reserve is 101.
create or replace function public.waitlist_offset() returns integer
language sql immutable as $$ select 100 $$;

-- Your number in the line: the order you arrived, offset by the starting
-- number, minus the spots you have jumped. Never below 1.
create or replace function public.waitlist_spot(p_username text)
returns table (out_position bigint, out_ahead bigint, out_total bigint, out_status text)
language sql stable as $$
  with me as (select * from public.waitlist where username = p_username)
  select
    case when me.status = 'waiting'
      then greatest(1, (me.created_seq + public.waitlist_offset()) - me.jumps) end,
    case when me.status = 'waiting'
      then greatest(0, (me.created_seq + public.waitlist_offset()) - me.jumps - 1) end,
    public.waitlist_offset() + (select count(*) from public.waitlist where status = 'waiting'),
    me.status
  from me
$$;

-- Start or resume today's game. Locks the row so two tabs can't start two games.
create or replace function public.waitlist_start_game(p_username text, p_qids integer[])
returns table (out_qids integer[], out_answered integer[], out_jumps integer, out_done boolean, out_status text)
language plpgsql as $$
declare
  r public.waitlist;
  today date := public.waitlist_today();
begin
  select * into r from public.waitlist where username = p_username for update;
  if not found then return; end if;
  if r.status <> 'waiting' then
    return query select '{}'::integer[], '{}'::integer[], 0, true, r.status; return;
  end if;
  if r.last_played_on = today then
    return query select r.game_qids, r.game_answered, r.game_jumps,
      cardinality(r.game_answered) >= cardinality(r.game_qids), r.status;
    return;
  end if;
  update public.waitlist
     set last_played_on = today, game_qids = p_qids, game_answered = '{}', game_jumps = 0
   where username = p_username;
  return query select p_qids, '{}'::integer[], 0, false, r.status;
end $$;

-- Record one answer. The API decides the gain (+5 right, +2 close, -2 wrong);
-- this enforces the daily ceiling of 10 and the floor at your starting spot.
create or replace function public.waitlist_answer(p_username text, p_qid integer, p_gain integer)
returns table (out_ok boolean, out_reason text, out_gained integer)
language plpgsql as $$
declare
  r public.waitlist;
  g integer;
begin
  select * into r from public.waitlist where username = p_username for update;
  if not found then return query select false, 'not_found', 0; return; end if;
  if r.status <> 'waiting' then return query select false, 'invited', 0; return; end if;
  if r.last_played_on is distinct from public.waitlist_today() or not (p_qid = any (r.game_qids)) then
    return query select false, 'no_game', 0; return;
  end if;
  if p_qid = any (r.game_answered) then return query select false, 'already_answered', 0; return; end if;

  if p_gain > 0 then
    g := least(p_gain, 5, greatest(0, 10 - r.game_jumps));
  else
    g := greatest(p_gain, -2, -r.jumps);
  end if;

  update public.waitlist
     set jumps = jumps + g,
         game_jumps = greatest(0, game_jumps + g),
         game_answered = array_append(game_answered, p_qid)
   where username = p_username;
  return query select true, null::text, g;
end $$;

-- Run this yourself after the invite message has gone out: marks them invited
-- and forgets their contact.  select public.waitlist_invite('some_username');
create or replace function public.waitlist_invite(p_username text)
returns void language sql as $$
  update public.waitlist set status = 'invited', notify_contact = null where username = p_username
$$;

revoke all on function public.waitlist_today(), public.waitlist_offset(), public.waitlist_spot(text),
  public.waitlist_start_game(text, integer[]), public.waitlist_answer(text, integer, integer),
  public.waitlist_invite(text) from public, anon, authenticated;
grant execute on function public.waitlist_today(), public.waitlist_offset(), public.waitlist_spot(text),
  public.waitlist_start_game(text, integer[]), public.waitlist_answer(text, integer, integer)
  to service_role;


-- ---------------------------------------------------------------------------
-- Approval and signup (see migrations/2026-10-12-approval-and-signup.sql)
-- ---------------------------------------------------------------------------

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
    -- The total has to be the same number the rest of the site shows this
    -- person, and waitlist_spot is the only thing that knows how it is
    -- presented (the live one adds a constant offset, so "3rd in line" reads
    -- as #103 of 107). For a username with no row there is nothing to ask it
    -- about, so borrow any waiting person's total — same function, same
    -- offset — rather than computing a raw count here that would disagree
    -- with every other screen. The bare count is only for an empty list.
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
