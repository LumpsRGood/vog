# Voice of the Guest Lists Sync

This project uses Supabase for public website intake and Microsoft Lists as the operational source of truth.

## Bridge Choice

The primary bridge is Power Automate:

`issues` insert -> Supabase database trigger -> Power Automate HTTP trigger -> Microsoft Lists `Guest Cases`

This avoids tenant-wide Microsoft Graph admin consent. The flow runs under the signed-in Microsoft account's normal SharePoint/Microsoft Lists connection.

The Edge Function can also use the same Power Automate flow when `POWER_AUTOMATE_SYNC_URL` is configured. If that variable is not set, it falls back to the Microsoft Graph path, which requires tenant admin consent for `Sites.ReadWrite.All`.

## Power Automate Setup

Use the instructions in:

`supabase/power-automate-flow.md`

## Supabase Project

Project ref:

```sh
gcafnpypmmkipdwkgejw
```

Project URL:

```sh
https://gcafnpypmmkipdwkgejw.supabase.co
```

## Deploy Database Trigger

Apply the migration:

`supabase/migrations/20260731110000_prepare_lists_sync.sql`

Then configure the trigger URL setting in SQL after the Power Automate flow is saved:

```sql
update public.vog_sync_settings
set value = 'POWER_AUTOMATE_HTTP_POST_URL',
    updated_at = now()
where key = 'lists_sync_url';

update public.vog_sync_settings
set value = '',
    updated_at = now()
where key = 'lists_sync_secret';
```

## Optional GitHub Actions Deployment

The repository includes `.github/workflows/deploy-supabase.yml`.

This workflow is for the optional Edge Function path. With `POWER_AUTOMATE_SYNC_URL`, it can deploy the no-admin-consent workaround. Without that variable, it uses Microsoft Graph and requires admin consent.

Add these repository secrets before running it:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`: `gcafnpypmmkipdwkgejw`
- `SUPABASE_DB_PASSWORD`
- `POWER_AUTOMATE_SYNC_URL`: the HTTP POST URL from `VOG - Supabase Issue to Guest Case`
- `MS_TENANT_ID`: `d654250b-024b-4116-ad8e-36b58a13810a`
- `MS_CLIENT_ID`: `190887df-14d8-4032-ac39-7ba33622123d`
- `MS_CLIENT_SECRET`
- `MS_SITE_HOSTNAME`: `opportunityrestaurantgroup-my.sharepoint.com`
- `MS_SITE_PATH`: `/personal/gchadrick_opportunityrestaurantgroup_com`
- `SYNC_WEBHOOK_SECRET`

Microsoft Graph admin consent is still required for `Sites.ReadWrite.All` only when using the Graph fallback instead of Power Automate.

## Test

Submit one test case through the website.

Expected result:

- A row is inserted into Supabase `issues`.
- A matching item appears in Microsoft Lists `Guest Cases`.
- The item has `Status = New`, `Priority = Normal`, `Intake Channel = Website Form`, `Source = voiceoftheguest.com`, store number, store email, city, state, and issue details.
