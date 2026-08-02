-- The public guest form needs insert-only access. Reads, updates, and deletes remain blocked.
drop policy if exists "Allow public issue intake" on public.issues;
drop policy if exists "Allow anonymous issue intake" on public.issues;
create policy "Allow anonymous issue intake"
  on public.issues
  for insert
  to anon, authenticated
  with check (true);
