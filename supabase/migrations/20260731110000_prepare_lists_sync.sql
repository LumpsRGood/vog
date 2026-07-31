create extension if not exists pg_net with schema extensions;

alter table public.issues
  add column if not exists store_number text,
  add column if not exists store_email text,
  add column if not exists intake_channel text default 'Website Form',
  add column if not exists source text default 'voiceoftheguest.com',
  add column if not exists synced_to_lists_at timestamptz,
  add column if not exists lists_sync_error text;

create index if not exists issues_created_at_idx on public.issues (created_at desc);
create index if not exists issues_store_number_idx on public.issues (store_number);
create index if not exists issues_state_city_idx on public.issues (state, city);
create index if not exists issues_contact_type_idx on public.issues (contact_type);

create or replace function public.notify_lists_issue_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sync_url text := current_setting('app.settings.lists_sync_url', true);
  sync_secret text := current_setting('app.settings.lists_sync_secret', true);
begin
  if sync_url is null or sync_url = '' then
    return new;
  end if;

  perform extensions.net.http_post(
    url := sync_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-vog-sync-secret', coalesce(sync_secret, '')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'record', to_jsonb(new)
    )
  );

  return new;
exception
  when others then
    update public.issues
      set lists_sync_error = sqlerrm
      where id = new.id;
    return new;
end;
$$;

drop trigger if exists issues_sync_to_lists on public.issues;

create trigger issues_sync_to_lists
after insert on public.issues
for each row
execute function public.notify_lists_issue_sync();
