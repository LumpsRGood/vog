alter table public.issues enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.issues to anon, authenticated;

drop policy if exists "Allow public guest issue intake" on public.issues;
drop policy if exists "Allow website guest issue inserts" on public.issues;

create policy "Allow website guest issue inserts"
on public.issues
as permissive
for insert
to anon, authenticated
with check (true);
