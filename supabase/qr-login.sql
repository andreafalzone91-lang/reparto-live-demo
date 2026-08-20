-- Reparto Live - credenziale QR personale revocabile.
-- Eseguire una sola volta nel SQL Editor del progetto Supabase.

create table if not exists public.qr_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.qr_login_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now(),
  success boolean not null default false
);

-- Associazione privata tra username e account. L'e-mail non viene mai esposta
-- al browser durante l'accesso con username.
create table if not exists public.login_usernames (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  normalized_username text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qr_login_attempts_user_time_idx
  on public.qr_login_attempts(user_id, attempted_at desc);

alter table public.qr_credentials enable row level security;
alter table public.qr_login_attempts enable row level security;
alter table public.login_usernames enable row level security;
revoke all on table public.qr_credentials from anon, authenticated;
revoke all on table public.qr_login_attempts from anon, authenticated;
revoke all on table public.login_usernames from anon, authenticated;

-- Le tabelle sono utilizzate soltanto dalla Edge Function con service role.
