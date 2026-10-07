-- Run this once in the Supabase SQL editor, on top of the existing schema.
--
-- Two changes:
--   1. The line starts at 100, so the first person to reserve is 101, the
--      second 102, and so on.
--   2. Read the Room now costs you something: +5 right, +2 close, -2 wrong,
--      and at most 10 spots a day. You can never fall behind where you started.

-- Today's game can move you at most 10 spots, not 15.
alter table public.waitlist drop constraint if exists waitlist_game_jumps_check;
alter table public.waitlist add constraint waitlist_game_jumps_check
  check (game_jumps between 0 and 10);
update public.waitlist set game_jumps = 10 where game_jumps > 10;

-- Where the line starts counting.
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

-- Record one answer. The API decides the gain (+5, +2 or -2); this enforces the
-- daily ceiling and the floor.
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
    -- at most 10 spots a day, however well you play
    g := least(p_gain, 5, greatest(0, 10 - r.game_jumps));
  else
    -- a wrong answer costs you, but never puts you behind where you started
    g := greatest(p_gain, -2, -r.jumps);
  end if;

  update public.waitlist
     set jumps = jumps + g,
         game_jumps = greatest(0, game_jumps + g),
         game_answered = array_append(game_answered, p_qid)
   where username = p_username;
  return query select true, null::text, g;
end $$;

revoke all on function public.waitlist_offset() from public, anon, authenticated;
grant execute on function public.waitlist_offset() to service_role;
