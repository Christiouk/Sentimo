-- =========================================================
-- SENTIMO · FULL SUPABASE SQL V2
-- =========================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  currency_code text not null default 'GBP',
  timezone text not null default 'Europe/London',
  theme text not null default 'dark' check (theme in ('dark','light')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  monthly_budget numeric(12,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_categories_user_active on public.categories(user_id, is_active);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  monthly_budget numeric(12,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_id, name)
);

create index if not exists idx_subcategories_user_id on public.subcategories(user_id);
create index if not exists idx_subcategories_category_id on public.subcategories(category_id);
create index if not exists idx_subcategories_user_active on public.subcategories(user_id, is_active);

drop trigger if exists trg_subcategories_updated_at on public.subcategories;
create trigger trg_subcategories_updated_at
before update on public.subcategories
for each row
execute function public.set_updated_at();

create table if not exists public.transaction_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  source_name text,
  imported_rows integer not null default 0,
  counted_rows integer not null default 0,
  excluded_rows integer not null default 0,
  watch_rows integer not null default 0,
  unmatched_rows integer not null default 0,
  imported_at timestamptz not null default now()
);

create index if not exists idx_transaction_imports_user_id on public.transaction_imports(user_id);
create index if not exists idx_transaction_imports_imported_at on public.transaction_imports(imported_at desc);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  tx_date date not null,
  description text not null,
  merchant_or_person text,
  entity_type text not null default 'Company'
    check (entity_type in ('Company','Person','Internal','Broker')),
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  tx_direction text not null
    check (tx_direction in ('income','expense')),
  tx_nature text not null default 'real'
    check (tx_nature in ('real','internal_transfer','savings_transfer','broker_transfer')),
  status text not null default 'counted'
    check (status in ('counted','excluded','watch','reverted')),
  amount numeric(12,2) not null,
  payment_method text,
  notes text,
  source text not null default 'manual',
  imported_file_id uuid references public.transaction_imports(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, local_id)
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, tx_date desc);
create index if not exists idx_transactions_user_category on public.transactions(user_id, category_id);
create index if not exists idx_transactions_user_subcategory on public.transactions(user_id, subcategory_id);
create index if not exists idx_transactions_user_status on public.transactions(user_id, status);
create index if not exists idx_transactions_user_direction on public.transactions(user_id, tx_direction);
create index if not exists idx_transactions_user_nature on public.transactions(user_id, tx_nature);
create index if not exists idx_transactions_imported_file on public.transactions(imported_file_id);

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

create table if not exists public.transaction_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_type text not null default 'contains'
    check (match_type in ('contains','exact','starts_with','ends_with')),
  keyword text,
  merchant text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  entity_type text default 'Company'
    check (entity_type in ('Company','Person','Internal','Broker')),
  tx_direction text
    check (tx_direction in ('income','expense')),
  tx_nature text
    check (tx_nature in ('real','internal_transfer','savings_transfer','broker_transfer')),
  status text not null default 'counted'
    check (status in ('counted','excluded','watch','reverted')),
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transaction_rules_user_id on public.transaction_rules(user_id);
create index if not exists idx_transaction_rules_user_active on public.transaction_rules(user_id, is_active);
create index if not exists idx_transaction_rules_user_priority on public.transaction_rules(user_id, priority);

drop trigger if exists trg_transaction_rules_updated_at on public.transaction_rules;
create trigger trg_transaction_rules_updated_at
before update on public.transaction_rules
for each row
execute function public.set_updated_at();

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  frequency text not null
    check (frequency in ('weekly','monthly','quarterly','annual','custom')),
  amount numeric(12,2) not null,
  due_day integer check (due_day between 1 and 31),
  next_due_date date,
  status text not null default 'scheduled'
    check (status in ('scheduled','pending','paid','overdue','archived')),
  auto_include_target boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fixed_expenses_user_id on public.fixed_expenses(user_id);
create index if not exists idx_fixed_expenses_user_status on public.fixed_expenses(user_id, status);
create index if not exists idx_fixed_expenses_next_due on public.fixed_expenses(user_id, next_due_date);

drop trigger if exists trg_fixed_expenses_updated_at on public.fixed_expenses;
create trigger trg_fixed_expenses_updated_at
before update on public.fixed_expenses
for each row
execute function public.set_updated_at();

create table if not exists public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_income_sources_user_id on public.income_sources(user_id);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  budget_period text not null default 'monthly'
    check (budget_period in ('weekly','monthly','annual')),
  amount numeric(12,2) not null,
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount >= 0),
  check (effective_to is null or effective_to >= effective_from)
);

create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_user_period on public.budgets(user_id, budget_period);
create index if not exists idx_budgets_effective on public.budgets(user_id, effective_from, effective_to);

drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at
before update on public.budgets
for each row
execute function public.set_updated_at();

create table if not exists public.daily_target_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  fixed_expenses_enabled boolean not null default true,
  variable_average_days integer not null default 30 check (variable_average_days between 1 and 365),
  custom_override numeric(12,2),
  include_weekends boolean not null default true,
  include_broker_withdrawals_as_income boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_target_settings_user_id on public.daily_target_settings(user_id);

drop trigger if exists trg_daily_target_settings_updated_at on public.daily_target_settings;
create trigger trg_daily_target_settings_updated_at
before update on public.daily_target_settings
for each row
execute function public.set_updated_at();

create table if not exists public.comparison_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('week','month','year')),
  period_start date not null,
  period_end date not null,
  total_income numeric(12,2) not null default 0,
  total_expenses numeric(12,2) not null default 0,
  net_position numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index if not exists idx_comparison_snapshots_user_id on public.comparison_snapshots(user_id);
create index if not exists idx_comparison_snapshots_period on public.comparison_snapshots(user_id, period_type, period_start desc);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  license_status text not null default 'none'
    check (license_status in ('none','trial','active','expired','cancelled')),
  trial_ends_at timestamptz,
  active_from timestamptz,
  active_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_licenses_user_id on public.licenses(user_id);
create index if not exists idx_licenses_status on public.licenses(license_status);

drop trigger if exists trg_licenses_updated_at on public.licenses;
create trigger trg_licenses_updated_at
before update on public.licenses
for each row
execute function public.set_updated_at();

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin'
    check (role in ('admin','super_admin','support')),
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_users_user_id on public.admin_users(user_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.transaction_imports enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_rules enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.income_sources enable row level security;
alter table public.budgets enable row level security;
alter table public.daily_target_settings enable row level security;
alter table public.comparison_snapshots enable row level security;
alter table public.licenses enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "profiles_own" on public.profiles;
drop policy if exists "categories_own" on public.categories;
drop policy if exists "subcategories_own" on public.subcategories;
drop policy if exists "transaction_imports_own" on public.transaction_imports;
drop policy if exists "transactions_own" on public.transactions;
drop policy if exists "transaction_rules_own" on public.transaction_rules;
drop policy if exists "fixed_expenses_own" on public.fixed_expenses;
drop policy if exists "income_sources_own" on public.income_sources;
drop policy if exists "budgets_own" on public.budgets;
drop policy if exists "daily_target_settings_own" on public.daily_target_settings;
drop policy if exists "comparison_snapshots_own" on public.comparison_snapshots;
drop policy if exists "licenses_own" on public.licenses;
drop policy if exists "admin_users_own" on public.admin_users;

create policy "profiles_own"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "categories_own"
on public.categories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "subcategories_own"
on public.subcategories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transaction_imports_own"
on public.transaction_imports
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions_own"
on public.transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transaction_rules_own"
on public.transaction_rules
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "fixed_expenses_own"
on public.fixed_expenses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "income_sources_own"
on public.income_sources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "budgets_own"
on public.budgets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily_target_settings_own"
on public.daily_target_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "comparison_snapshots_own"
on public.comparison_snapshots
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "licenses_own"
on public.licenses
for select
using (auth.uid() = user_id);

create policy "admin_users_own"
on public.admin_users
for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.daily_target_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.licenses (user_id, license_status)
  values (new.id, 'none')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace view public.v_real_cashflow as
select
  t.user_id,
  t.tx_date,
  t.id,
  t.description,
  t.merchant_or_person,
  t.tx_direction,
  t.tx_nature,
  t.status,
  t.amount,
  c.name as category_name,
  s.name as subcategory_name
from public.transactions t
left join public.categories c on c.id = t.category_id
left join public.subcategories s on s.id = t.subcategory_id
where t.status = 'counted'
  and t.tx_nature = 'real';
