create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  constraint expense_categories_name_check check (char_length(trim(name)) > 0),
  constraint expense_categories_user_name_unique unique (user_id, name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  amount numeric(12,2) not null,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint expenses_amount_check check (amount >= 0)
);

create index if not exists expense_categories_user_id_idx
  on public.expense_categories(user_id);

create index if not exists expenses_user_id_idx
  on public.expenses(user_id);

create index if not exists expenses_category_id_idx
  on public.expenses(category_id);

create index if not exists expenses_user_date_idx
  on public.expenses(user_id, date desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.ensure_expense_category_matches_user()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.expense_categories c
    where c.id = new.category_id
      and c.user_id = new.user_id
  ) then
    raise exception 'Category does not belong to this user';
  end if;

  return new;
end;
$$;

drop trigger if exists expenses_category_user_check on public.expenses;

create trigger expenses_category_user_check
before insert or update on public.expenses
for each row
execute function public.ensure_expense_category_matches_user();

alter table public.profiles enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can view their own categories"
on public.expense_categories
for select
using (auth.uid() = user_id);

create policy "Users can insert their own categories"
on public.expense_categories
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own categories"
on public.expense_categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
on public.expense_categories
for delete
using (auth.uid() = user_id);

create policy "Users can view their own expenses"
on public.expenses
for select
using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
on public.expenses
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
on public.expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own expenses"
on public.expenses
for delete
using (auth.uid() = user_id);

comment on table public.profiles is 'Stores app-level user profile data linked to Supabase Auth users.';
comment on table public.expense_categories is 'User-owned expense categories.';
comment on table public.expenses is 'User-owned expense records.';

comment on column public.expense_categories.icon is 'Optional icon identifier for UI display.';
comment on column public.expense_categories.color is 'Optional hex color for cozy category styling.';

-- Example seed categories:
-- Replace the UUID below with a real profiles.id before running.
--
-- insert into public.expense_categories (user_id, name, icon, color)
-- values
--   ('00000000-0000-0000-0000-000000000000', 'Food', 'utensils', '#8B5E3C'),
--   ('00000000-0000-0000-0000-000000000000', 'Groceries', 'shopping-basket', '#3F8F68'),
--   ('00000000-0000-0000-0000-000000000000', 'Transport', 'car', '#7FBF9A'),
--   ('00000000-0000-0000-0000-000000000000', 'Shopping', 'bag', '#C8A27C'),
--   ('00000000-0000-0000-0000-000000000000', 'Coffee', 'coffee', '#A67C52'),
--   ('00000000-0000-0000-0000-000000000000', 'Bills', 'receipt', '#6E8B74'),
--   ('00000000-0000-0000-0000-000000000000', 'Health', 'heart', '#D28B7C'),
--   ('00000000-0000-0000-0000-000000000000', 'Entertainment', 'film', '#8D7BAF');
