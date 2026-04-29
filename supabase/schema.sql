create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  monthly_budget numeric default 0,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  local_id text,
  tx_date date not null,
  description text not null,
  entity text,
  entity_type text check (entity_type in ('Company','Person','Internal','Broker')) default 'Company',
  category text not null,
  tx_type text check (tx_type in ('income','expense','internal_in','internal_out','investment_in','investment_out')) not null,
  status text check (status in ('counted','excluded','watch','reverted')) not null default 'counted',
  amount numeric not null,
  source text default 'manual',
  imported_file text,
  created_at timestamptz default now(),
  unique(user_id, local_id)
);

create table if not exists fixed_obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  monthly_amount numeric not null,
  due_day text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists import_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  keywords text[] not null,
  tx_type text not null,
  category text not null,
  entity_type text default 'Company',
  entity text,
  status text default 'counted',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table fixed_obligations enable row level security;
alter table import_rules enable row level security;

drop policy if exists "profiles-own" on profiles;
drop policy if exists "categories-own" on categories;
drop policy if exists "transactions-own" on transactions;
drop policy if exists "fixed-obligations-own" on fixed_obligations;
drop policy if exists "import-rules-own" on import_rules;

create policy "profiles-own" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "categories-own" on categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions-own" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fixed-obligations-own" on fixed_obligations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "import-rules-own" on import_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
