-- SerioFlow: cinque chat, una per ciascun CT.
-- Il personale entra automaticamente nella chat del CT presente nel turno attivo.

create or replace function public.active_ct_chat_room()
returns text
language sql stable security definer
set search_path = public
as $$
  with clock as (
    select now() at time zone 'Europe/Rome' as local_time
  ), active_shift as (
    select
      case
        when extract(hour from local_time) < 6 then (local_time::date - 1)::text
        else local_time::date::text
      end as shift_date,
      case
        when extract(hour from local_time) between 6 and 13 then '1'
        when extract(hour from local_time) between 14 and 21 then '2'
        else '3'
      end as shift_code
    from clock
  )
  select 'CT-' || (person->>'id')
  from public.shared_state state
  cross join active_shift shift
  cross join lateral jsonb_array_elements(coalesce(state.payload->'shifts'->'people', '[]'::jsonb)) person
  where state.id = 1
    and coalesce(person->>'id', '') <> ''
    and upper(coalesce(person->>'jobTitle', '')) !~ 'VICE'
    and upper(coalesce(person->>'jobTitle', '')) ~ '(^|[^A-Z])CT([^A-Z]|$)|CAPOTURNO'
    and coalesce(
      state.payload->'shifts'->'assignments'->>((person->>'id') || '|' || shift.shift_date),
      ''
    ) = shift.shift_code
  order by person->>'name'
  limit 1;
$$;

create or replace function public.can_access_team_chat(requested_team text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.status = 'approved'
      and (
        profile.role in ('admin', 'direttore')
        or (profile.role in ('ct', 'vice_ct') and requested_team like 'CT-%')
        or requested_team = public.active_ct_chat_room()
        or (requested_team <> '' and requested_team = coalesce(profile.team_code, ''))
      )
  );
$$;

create or replace function public.available_chat_teams()
returns table(team_code text, team_color text)
language sql stable security definer
set search_path = public
as $$
  with viewer as (
    select role
    from public.profiles
    where id = auth.uid() and status = 'approved'
  ), ct_rooms as (
    select
      'CT-' || (person->>'id') as code,
      coalesce(nullif(person->>'teamColor', ''), '#168544') as color
    from public.shared_state state
    cross join lateral jsonb_array_elements(coalesce(state.payload->'shifts'->'people', '[]'::jsonb)) person
    where state.id = 1
      and coalesce(person->>'id', '') <> ''
      and upper(coalesce(person->>'jobTitle', '')) !~ 'VICE'
      and upper(coalesce(person->>'jobTitle', '')) ~ '(^|[^A-Z])CT([^A-Z]|$)|CAPOTURNO'
  )
  select room.code, room.color
  from ct_rooms room
  cross join viewer
  where viewer.role in ('admin', 'direttore', 'ct', 'vice_ct')
     or room.code = public.active_ct_chat_room()
  order by room.code;
$$;

revoke all on function public.active_ct_chat_room() from public, anon;
grant execute on function public.active_ct_chat_room() to authenticated;
grant execute on function public.can_access_team_chat(text) to authenticated;
grant execute on function public.available_chat_teams() to authenticated;
