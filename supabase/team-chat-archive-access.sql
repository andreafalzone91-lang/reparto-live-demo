-- SerioFlow · archivio chat per ruolo.
-- Amministratore e Direttore vedono tutte le chat archiviate.
-- Ogni CT vede soltanto la propria chat. Gli altri ruoli accedono solo alla chat attiva.

create or replace function public.own_ct_chat_room()
returns text
language sql stable security definer
set search_path = public
as $$
  with viewer as (
    select upper(trim(coalesce(display_name, ''))) as display_name
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role = 'ct'
  )
  select 'CT-' || (person->>'id')
  from public.shared_state state
  cross join viewer
  cross join lateral jsonb_array_elements(coalesce(state.payload->'shifts'->'people', '[]'::jsonb)) person
  where state.id = 1
    and coalesce(person->>'id', '') <> ''
    and upper(trim(coalesce(person->>'name', ''))) = viewer.display_name
    and upper(coalesce(person->>'jobTitle', '')) !~ 'VICE'
    and upper(coalesce(person->>'jobTitle', '')) ~ '(^|[^A-Z])CT([^A-Z]|$)|CAPOTURNO'
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
        or (profile.role = 'ct' and requested_team = public.own_ct_chat_room())
        or requested_team = public.active_ct_chat_room()
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
  where viewer.role in ('admin', 'direttore')
     or (viewer.role = 'ct' and room.code = public.own_ct_chat_room())
     or room.code = public.active_ct_chat_room()
  order by room.code;
$$;

revoke all on function public.own_ct_chat_room() from public, anon;
grant execute on function public.own_ct_chat_room() to authenticated;
grant execute on function public.can_access_team_chat(text) to authenticated;
grant execute on function public.available_chat_teams() to authenticated;
