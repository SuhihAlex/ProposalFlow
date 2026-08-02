begin;

create type public.proposal_status as enum (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'rejected',
  'expired'
);

create type public.proposal_discount_type as enum (
  'none',
  'percentage',
  'fixed'
);

create type public.proposal_section_type as enum (
  'task_understanding',
  'proposed_solution',
  'scope',
  'work_stages',
  'expected_result',
  'next_steps',
  'custom'
);

create type public.proposal_response_type as enum (
  'accepted',
  'rejected'
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,
  company_id uuid not null
    references public.companies(id)
    on delete cascade,
  company_name text not null
    check (char_length(company_name) between 2 and 160),
  contact_name text not null
    check (char_length(contact_name) between 2 and 120),
  email text not null
    check (char_length(email) between 3 and 320),
  notes text not null default ''
    check (char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,
  company_id uuid not null
    references public.companies(id)
    on delete cascade,
  name text not null
    check (char_length(name) between 2 and 160),
  description text not null default ''
    check (char_length(description) <= 1000),
  price numeric(14, 2) not null default 0
    check (price >= 0),
  unit text not null
    check (
      unit in (
        'project',
        'hour',
        'day',
        'page',
        'month',
        'item'
      )
    ),
  category text not null
    check (char_length(category) between 2 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,
  company_id uuid not null
    references public.companies(id)
    on delete cascade,
  client_id uuid
    references public.clients(id)
    on delete set null,
  proposal_number text not null
    check (char_length(proposal_number) between 1 and 50),
  project_title text not null
    check (char_length(project_title) between 2 and 200),
  brief text not null default ''
    check (char_length(brief) <= 5000),
  status public.proposal_status not null default 'draft',
  currency text not null default 'USD'
    check (currency ~ '^[A-Z]{3}$'),
  discount_type public.proposal_discount_type
    not null default 'none',
  discount_value numeric(14, 2) not null default 0
    check (discount_value >= 0),
  subtotal numeric(14, 2) not null default 0
    check (subtotal >= 0),
  total numeric(14, 2) not null default 0
    check (total >= 0),
  valid_until date not null,
  public_token text unique,
  published_at timestamptz,
  last_viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint proposals_owner_number_unique
    unique (owner_id, proposal_number),

  constraint proposals_discount_percentage_valid
    check (
      discount_type <> 'percentage'
      or discount_value <= 100
    ),

  constraint proposals_public_token_length
    check (
      public_token is null
      or char_length(public_token) >= 24
    )
);

create table public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null
    references public.proposals(id)
    on delete cascade,
  section_type public.proposal_section_type not null,
  title text not null
    check (char_length(title) between 1 and 160),
  content text not null default ''
    check (char_length(content) <= 20000),
  position integer not null default 0
    check (position >= 0),
  is_ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null
    references public.proposals(id)
    on delete cascade,
  service_id uuid
    references public.services(id)
    on delete set null,
  name text not null
    check (char_length(name) between 1 and 160),
  description text not null default ''
    check (char_length(description) <= 1000),
  quantity numeric(12, 2) not null default 1
    check (quantity > 0),
  unit text not null
    check (
      unit in (
        'project',
        'hour',
        'day',
        'page',
        'month',
        'item'
      )
    ),
  unit_price numeric(14, 2) not null default 0
    check (unit_price >= 0),
  line_total numeric(14, 2)
    generated always as (
      round(quantity * unit_price, 2)
    ) stored,
  position integer not null default 0
    check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposal_views (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null
    references public.proposals(id)
    on delete cascade,
  viewed_at timestamptz not null default now(),
  visitor_hash text,
  user_agent text
    check (
      user_agent is null
      or char_length(user_agent) <= 1000
    )
);

create table public.proposal_responses (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique
    references public.proposals(id)
    on delete cascade,
  response public.proposal_response_type not null,
  responded_at timestamptz not null default now(),
  client_name text
    check (
      client_name is null
      or char_length(client_name) <= 120
    ),
  client_email text
    check (
      client_email is null
      or char_length(client_email) <= 320
    )
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique
    references public.profiles(id)
    on delete cascade,
  plan public.subscription_plan not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive'
    check (
      status in (
        'inactive',
        'trialing',
        'active',
        'past_due',
        'canceled'
      )
    ),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_owner_created_idx
on public.clients (owner_id, created_at desc);

create index clients_company_idx
on public.clients (company_id);

create index services_owner_created_idx
on public.services (owner_id, created_at desc);

create index services_company_category_idx
on public.services (company_id, category);

create index proposals_owner_status_updated_idx
on public.proposals (owner_id, status, updated_at desc);

create index proposals_company_idx
on public.proposals (company_id);

create index proposals_client_idx
on public.proposals (client_id);

create index proposal_sections_proposal_position_idx
on public.proposal_sections (proposal_id, position);

create index proposal_items_proposal_position_idx
on public.proposal_items (proposal_id, position);

create index proposal_views_proposal_viewed_idx
on public.proposal_views (proposal_id, viewed_at desc);

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create trigger proposals_set_updated_at
before update on public.proposals
for each row
execute function public.set_updated_at();

create trigger proposal_sections_set_updated_at
before update on public.proposal_sections
for each row
execute function public.set_updated_at();

create trigger proposal_items_set_updated_at
before update on public.proposal_items
for each row
execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

insert into public.subscriptions (
  owner_id,
  plan,
  status
)
select
  profiles.id,
  profiles.plan,
  'inactive'
from public.profiles
on conflict (owner_id) do nothing;

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
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      ''
    )
  );

  insert into public.subscriptions (
    owner_id,
    plan,
    status
  )
  values (
    new.id,
    'free',
    'inactive'
  );

  return new;
end;
$$;

alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_sections enable row level security;
alter table public.proposal_items enable row level security;
alter table public.proposal_views enable row level security;
alter table public.proposal_responses enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can view their own clients"
on public.clients
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own clients"
on public.clients
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own clients"
on public.clients
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own clients"
on public.clients
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can view their own services"
on public.services
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own services"
on public.services
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own services"
on public.services
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own services"
on public.services
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can view their own proposals"
on public.proposals
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own proposals"
on public.proposals
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own proposals"
on public.proposals
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own proposals"
on public.proposals
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can view their own proposal sections"
on public.proposal_sections
for select
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_sections.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can create their own proposal sections"
on public.proposal_sections
for insert
to authenticated
with check (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_sections.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can update their own proposal sections"
on public.proposal_sections
for update
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_sections.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_sections.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can delete their own proposal sections"
on public.proposal_sections
for delete
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_sections.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can view their own proposal items"
on public.proposal_items
for select
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_items.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can create their own proposal items"
on public.proposal_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_items.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can update their own proposal items"
on public.proposal_items
for update
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_items.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_items.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can delete their own proposal items"
on public.proposal_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_items.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can view their own proposal views"
on public.proposal_views
for select
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_views.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can view their own proposal responses"
on public.proposal_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.proposals
    where proposals.id =
      proposal_responses.proposal_id
      and proposals.owner_id =
        (select auth.uid())
  )
);

create policy "Users can view their own subscription"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on table public.clients from anon;
revoke all on table public.services from anon;
revoke all on table public.proposals from anon;
revoke all on table public.proposal_sections from anon;
revoke all on table public.proposal_items from anon;
revoke all on table public.proposal_views from anon;
revoke all on table public.proposal_responses from anon;
revoke all on table public.subscriptions from anon;

grant select, insert, update, delete
on table public.clients
to authenticated;

grant select, insert, update, delete
on table public.services
to authenticated;

grant select, insert, update, delete
on table public.proposals
to authenticated;

grant select, insert, update, delete
on table public.proposal_sections
to authenticated;

grant select, insert, update, delete
on table public.proposal_items
to authenticated;

grant select
on table public.proposal_views
to authenticated;

grant select
on table public.proposal_responses
to authenticated;

grant select
on table public.subscriptions
to authenticated;

grant usage
on type public.proposal_status
to authenticated;

grant usage
on type public.proposal_discount_type
to authenticated;

grant usage
on type public.proposal_section_type
to authenticated;

grant usage
on type public.proposal_response_type
to authenticated;

commit;