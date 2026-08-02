begin;

create type public.subscription_plan as enum (
  'free',
  'solo',
  'studio'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  plan public.subscription_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '',
  logo_path text,
  email text not null default '',
  phone text,
  website text,
  currency text not null default 'USD'
    check (currency ~ '^[A-Z]{3}$'),
  accent_color text not null default '#0F766E'
    check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile associated one-to-one with a Supabase Auth user.';

comment on table public.companies is
  'Single company profile owned by a ProposalFlow user.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can view their own company"
on public.companies
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own company"
on public.companies
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own company"
on public.companies
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own company"
on public.companies
for delete
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on table public.profiles from anon;
revoke all on table public.companies from anon;

grant select, update
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.companies
to authenticated;

revoke execute
on function public.handle_new_user()
from public, anon, authenticated;

revoke execute
on function public.set_updated_at()
from public, anon, authenticated;

commit;