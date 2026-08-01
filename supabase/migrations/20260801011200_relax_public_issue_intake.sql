alter table public.issues enable row level security;

grant insert on public.issues to anon;

drop policy if exists "Allow public guest issue intake" on public.issues;

create policy "Allow public guest issue intake"
on public.issues
for insert
to anon
with check (true);
