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
supabase secrets set MS_TENANT_ID="d654250b-024b-4116-ad8e-36b58a13810a"
supabase secrets set MS_CLIENT_ID="190887df-14d8-4032-ac39-7ba33622123d"
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

Project ref:

```sh
gcafnpypmmkipdwkgejw
```

```sh
supabase db push
supabase functions deploy sync-issue-to-lists
```

Then configure the trigger URL settings in SQL:

```sql
alter database postgres set app.settings.lists_sync_url =
  'https://gcafnpypmmkipdwkgejw.supabase.co/functions/v1/sync-issue-to-lists';

alter database postgres set app.settings.lists_sync_secret =
  'same-long-random-secret-used-for-SYNC_WEBHOOK_SECRET';
```

Reconnect or restart the database session after changing database settings.

## GitHub Actions Deployment

The repository includes `.github/workflows/deploy-supabase.yml`.

Add these repository secrets before running it:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`: `gcafnpypmmkipdwkgejw`
- `SUPABASE_DB_PASSWORD`
- `MS_TENANT_ID`: `d654250b-024b-4116-ad8e-36b58a13810a`
- `MS_CLIENT_ID`: `190887df-14d8-4032-ac39-7ba33622123d`
- `MS_CLIENT_SECRET`
- `MS_SITE_HOSTNAME`: `opportunityrestaurantgroup-my.sharepoint.com`
- `MS_SITE_PATH`: `/personal/gchadrick_opportunityrestaurantgroup_com`
- `SYNC_WEBHOOK_SECRET`

Microsoft Graph admin consent is still required for `Sites.ReadWrite.All` before the sync can write to Microsoft Lists.

## Test

Submit one test case through the website.

Expected result:

- A row is inserted into Supabase `issues`.
- A matching item appears in Microsoft Lists `Guest Cases`.
- The item has `Status = New`, `Priority = Normal`, `Intake Channel = Website Form`, `Source = voiceoftheguest.com`, store number, store email, city, state, and issue details.
