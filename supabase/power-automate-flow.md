# Power Automate Flow: Supabase Issue to Guest Case

Use this flow when Microsoft Graph application consent is not available.

## Flow Name

`VOG - Supabase Issue to Guest Case`

## Trigger

Power Automate trigger:

`When an HTTP request is received`

Request body JSON schema:

```json
{
  "type": "object",
  "properties": {
    "type": { "type": "string" },
    "table": { "type": "string" },
    "record": {
      "type": "object",
      "properties": {
        "id": {},
        "created_at": { "type": "string" },
        "name": { "type": "string" },
        "contact_type": { "type": "string" },
        "contact_method": { "type": "string" },
        "email": { "type": ["string", "null"] },
        "phone": { "type": ["string", "null"] },
        "date": { "type": ["string", "null"] },
        "state": { "type": ["string", "null"] },
        "city": { "type": ["string", "null"] },
        "address": { "type": ["string", "null"] },
        "store_number": { "type": ["string", "number", "null"] },
        "store_email": { "type": ["string", "null"] },
        "intake_channel": { "type": ["string", "null"] },
        "source": { "type": ["string", "null"] },
        "issue": { "type": ["string", "null"] }
      }
    }
  }
}
```

## Action

Action:

`Create item`

Connector:

`SharePoint`

List:

`Guest Cases`

Site address:

`https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations`

Recommended field mapping:

| Microsoft Lists field | Power Automate value |
| --- | --- |
| Case ID | `concat('VOG-', formatDateTime(utcNow(), 'yyyy'), '-', triggerBody()?['record']?['id'])` |
| Submitted At | `triggerBody()?['record']?['created_at']` |
| Contact Type | `triggerBody()?['record']?['contact_type']` |
| Guest Name | `triggerBody()?['record']?['name']` |
| Preferred Contact Method | `triggerBody()?['record']?['contact_method']` |
| Guest Email | `triggerBody()?['record']?['email']` |
| Guest Phone | `triggerBody()?['record']?['phone']` |
| Incident Date | `triggerBody()?['record']?['date']` |
| Store Number | `triggerBody()?['record']?['store_number']` |
| Store Name | `concat('IHOP ', triggerBody()?['record']?['store_number'])` |
| State | `triggerBody()?['record']?['state']` |
| City | `triggerBody()?['record']?['city']` |
| Address | `triggerBody()?['record']?['address']` |
| Issue Description | `triggerBody()?['record']?['issue']` |
| Status | `New` |
| Priority | `Normal` |
| Severity | `Normal` |
| Case Category | `Other` |
| Source | `voiceoftheguest.com` |
| Intake Channel | `Website Form` |
| Store Email | `triggerBody()?['record']?['store_email']` |
| Reopened | `No` |
| Supabase ID | `triggerBody()?['record']?['id']` |

## Supabase Setting

After saving the Power Automate flow, copy the HTTP POST URL and set:

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
