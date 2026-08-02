alter table public.issues
  add column if not exists issue_category text,
  add column if not exists issue_subcategory text,
  add column if not exists notes text,
  add column if not exists status text not null default 'New',
  add column if not exists priority text not null default 'Normal',
  add column if not exists assigned_to text,
  add column if not exists due_date timestamptz,
  add column if not exists resolved_date timestamptz,
  add column if not exists closed_date timestamptz,
  add column if not exists resolution_type text,
  add column if not exists resolution_summary text;

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues(id) on delete cascade,
  case_id text,
  activity_at timestamptz not null default now(),
  staff_member text,
  activity_type text not null default 'Note',
  note text not null,
  next_action text,
  next_follow_up_date timestamptz,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;
create policy "authenticated users can manage activities" on public.activities
  for all to authenticated using (true) with check (true);
