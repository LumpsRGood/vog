# Voice of the Guest Lists Sync

This project uses Supabase for public website intake and Microsoft Lists as the operational source of truth.

## Bridge Choice

The bridge is a Supabase Edge Function:

`issues` insert -> Supabase database trigger -> `sync-issue-to-lists` Edge Function -> Microsoft Graph -> Microsoft Lists `Guest Cases`

This keeps website intake simple and keeps the work queue, status, follow-up, and reporting in Microsoft Lists.

## Required Microsoft App Permissions

Create or use an Azure app registration with application permissions:

- `Sites.ReadWrite.All`

Grant admin consent after adding the permission.

## Supabase Function Secrets

Set these secrets before deploying the function:

```sh
supabase secrets set MS_TENANT_ID="..."
supabase secrets set MS_CLIENT_ID="..."
supabase secrets set MS_CLIENT_SECRET="..."
supabase secrets set MS_SITE_HOSTNAME="opportunityrestaurantgroup-my.sharepoint.com"
supabase secrets set MS_SITE_PATH="/personal/gchadrick_opportunityrestaurantgroup_com"
supabase secrets set SYNC_WEBHOOK_SECRET="choose-a-long-random-secret"
```

Optional, but useful after the first successful lookup:

```sh
supabase secrets set MS_SITE_ID="..."
supabase secrets set MS_GUEST_CASES_LIST_ID="..."
```

## Deploy

```sh
supabase db push
supabase functions deploy sync-issue-to-lists
```

Then configure the trigger URL settings in SQL:

```sql
alter database postgres set app.settings.lists_sync_url =
  'https://PROJECT_REF.supabase.co/functions/v1/sync-issue-to-lists';

alter database postgres set app.settings.lists_sync_secret =
  'same-long-random-secret-used-for-SYNC_WEBHOOK_SECRET';
```

Reconnect or restart the database session after changing database settings.

## Test

Submit one test case through the website.

Expected result:

- A row is inserted into Supabase `issues`.
- A matching item appears in Microsoft Lists `Guest Cases`.
- The item has `Status = New`, `Priority = Normal`, `Intake Channel = Website Form`, `Source = voiceoftheguest.com`, store number, store email, city, state, and issue details.

