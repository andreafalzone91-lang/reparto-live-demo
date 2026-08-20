-- Reparto Live · chat protetta per squadra
-- Eseguire una sola volta nel SQL Editor del progetto Supabase.

alter table public.profiles add column if not exists team_code text;
alter table public.profiles add column if not exists team_color text;

create table if not exists public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  team_code text not null check (length(trim(team_code)) between 1 and 40),
  user_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  author_name text not null default '',
  body text not null check (length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists team_chat_messages_team_created_idx
  on public.team_chat_messages (team_code, created_at desc);

create table if not exists public.team_chat_reads (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  team_code text not null,
  last_read_at timestamptz not null default now(),
  primary key (user_id, team_code)
);

create or replace function public.chat_user_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), '');
$$;

create or replace function public.chat_user_team()
returns text
language sql stable security definer
set search_path = public
as $$
  select coalesce((select team_code from public.profiles where id = auth.uid()), '');
$$;

create or replace function public.can_access_team_chat(requested_team text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.chat_user_role() in ('admin', 'direttore')
    or (requested_team <> '' and requested_team = public.chat_user_team());
$$;

create or replace function public.available_chat_teams()
returns table(team_code text, team_color text)
language sql stable security definer
set search_path = public
as $$
  select distinct p.team_code, coalesce(nullif(p.team_color, ''), '#168544')
  from public.profiles p
  where p.team_code is not null
    and trim(p.team_code) <> ''
    and (
      public.chat_user_role() in ('admin', 'direttore')
      or p.team_code = public.chat_user_team()
    )
  order by p.team_code;
$$;

create or replace function public.prepare_team_chat_message()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.author_name := coalesce(
    (select display_name from public.profiles where id = auth.uid()),
    'Utente'
  );
  new.body := trim(new.body);
  new.team_code := trim(new.team_code);
  return new;
end;
$$;

drop trigger if exists prepare_team_chat_message_trigger on public.team_chat_messages;
create trigger prepare_team_chat_message_trigger
before insert on public.team_chat_messages
for each row execute function public.prepare_team_chat_message();

alter table public.team_chat_messages enable row level security;
alter table public.team_chat_reads enable row level security;

drop policy if exists "team chat select" on public.team_chat_messages;
create policy "team chat select" on public.team_chat_messages
for select to authenticated
using (public.can_access_team_chat(team_code));

drop policy if exists "team chat insert" on public.team_chat_messages;
create policy "team chat insert" on public.team_chat_messages
for insert to authenticated
with check (
  auth.uid() = user_id
  and public.can_access_team_chat(team_code)
);

drop policy if exists "own chat reads select" on public.team_chat_reads;
create policy "own chat reads select" on public.team_chat_reads
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own chat reads insert" on public.team_chat_reads;
create policy "own chat reads insert" on public.team_chat_reads
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "own chat reads update" on public.team_chat_reads;
create policy "own chat reads update" on public.team_chat_reads
for update to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on function public.chat_user_role() from public, anon;
revoke all on function public.chat_user_team() from public, anon;
revoke all on function public.can_access_team_chat(text) from public, anon;
revoke all on function public.available_chat_teams() from public, anon;

grant select, insert on public.team_chat_messages to authenticated;
grant select, insert, update on public.team_chat_reads to authenticated;
grant execute on function public.chat_user_role() to authenticated;
grant execute on function public.chat_user_team() to authenticated;
grant execute on function public.can_access_team_chat(text) to authenticated;
grant execute on function public.available_chat_teams() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_chat_messages'
  ) then
    alter publication supabase_realtime add table public.team_chat_messages;
  end if;
end $$;
