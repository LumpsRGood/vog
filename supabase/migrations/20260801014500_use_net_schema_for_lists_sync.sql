create or replace function public.notify_lists_issue_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sync_url text;
  sync_secret text;
  store_number_text text;
  normalized_record jsonb;
begin
  select value into sync_url
  from public.vog_sync_settings
  where key = 'lists_sync_url';

  if sync_url is null or sync_url = '' then
    return new;
  end if;

  select value into sync_secret
  from public.vog_sync_settings
  where key = 'lists_sync_secret';

  store_number_text := coalesce(new.store_number, '');

  normalized_record := to_jsonb(new)
    || jsonb_build_object(
      'contact_type',
        case lower(coalesce(new.contact_type, ''))
          when 'celebration' then 'Celebration'
          else 'Opportunity'
        end,
      'contact_method',
        case lower(coalesce(new.contact_method, ''))
          when 'phone' then 'Phone'
          when 'text' then 'Text'
          else 'Email'
        end,
      'store_number', store_number_text,
      'store_email',
        coalesce(
          nullif(new.store_email, ''),
          case
            when store_number_text <> '' then 'ihop' || store_number_text || '@opportunityrestaurantgroup.com'
            else ''
          end
        ),
      'intake_channel', coalesce(nullif(new.intake_channel, ''), 'Website Form'),
      'source', coalesce(nullif(new.source, ''), 'voiceoftheguest.com')
    );

  perform net.http_post(
    url := sync_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-vog-sync-secret', coalesce(sync_secret, '')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'record', normalized_record
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
