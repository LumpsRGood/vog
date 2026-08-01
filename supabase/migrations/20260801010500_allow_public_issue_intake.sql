alter table public.issues enable row level security;

drop policy if exists "Allow public guest issue intake" on public.issues;

create policy "Allow public guest issue intake"
on public.issues
for insert
to anon
with check (
  coalesce(source, 'voiceoftheguest.com') = 'voiceoftheguest.com'
  and coalesce(intake_channel, 'Website Form') = 'Website Form'
);
