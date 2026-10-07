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
  game_jumps      integer not null default 0 check (game_jumps between 0 and 10)
);

create index if not exists waitlist_line_idx
  on public.waitlist ((created_seq - jumps), created_seq)
  where status = 'waiting';

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
