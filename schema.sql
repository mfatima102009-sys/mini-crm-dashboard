-- Run this script in the Supabase SQL Editor.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  business_name text not null,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Converted')),
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- The Express backend uses the Supabase service-role key, which bypasses RLS.
-- Keep that key only on the server in .env; never expose it in browser code.
alter table public.leads enable row level security;
