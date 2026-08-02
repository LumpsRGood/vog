# VOG Reporting Data Contract

Microsoft Lists is the reporting source of truth. The SharePoint workbook consumes four named Excel tables and never writes business changes back to the Lists.

## Guest Cases

Required reporting additions:

| Display name | Type | Values / rule |
| --- | --- | --- |
| First Response Date | Date and time | First meaningful staff response |
| Current Escalation Level | Choice | None; Coaching; Retraining; Written action plan; Leadership escalation; Verified correction |
| Exclude from Reporting | Yes/No | Default No |
| Normalized Guest Key | Single line text | email:lowercase-address or phone:digits-only |

Existing case fields remain authoritative for status, priority, assignment, follow-up, resolution, store, issue taxonomy and case dates.

## Corrective Actions

List URL: https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Lists/Corrective%20Actions/AllItems.aspx

| Display name | Type | Values / rule |
| --- | --- | --- |
| Action ID | Single line text | Rename Title; required and unique operating identifier |
| Triggering Case ID | Single line text | Required |
| Store Number | Single line text | Required |
| Issue Category | Choice | Match Guest Cases taxonomy |
| Issue Subcategory | Single line text | Match Guest Cases value |
| Root Cause | Multiple lines text | Required before action closure |
| Action Level | Choice | Coaching; Retraining; Written action plan; Leadership escalation; Verified correction |
| Corrective Action Description | Multiple lines text | Required |
| Responsible Owner | Person or Group | Required |
| Initiated Date | Date only | Required |
| Target Date | Date only | Required |
| Completed Date | Date only | Optional until complete |
| Verification Date | Date only | Optional until verified |
| Verification Method | Multiple lines text | Observation, audit, trend review or other evidence |
| Outcome | Choice | Open; Effective; Partially Effective; Ineffective; Escalated |
| Previous Action ID | Single line text | Prior action in the escalation chain |
| Escalation Notes | Multiple lines text | Reason for escalation and leadership decision |
| Exclude from Reporting | Yes/No | Default No |
| Case Link | Hyperlink | Direct filtered Guest Cases URL |

## Workbook Tables

- CasesData on Data Cases
- ActivitiesData on Data Activities
- CorrectiveActionsData on Data Corrective Actions
- StoresData on Data Stores

Power Automate replaces only table body rows. Headers, formulas, validation, charts and presentation sheets remain untouched.

## Recurrence Rules

- Store repeat offender: at least two non-excluded cases at the same store in the same issue category during the rolling 90-day window.
- Post-action recurrence: a non-excluded case at the same store and category after the corrective action completed date.
- Repeat guest: more than one non-excluded case sharing a normalized email or phone key.
- Verification overdue: outcome is Open and the target date has passed, or a completed action has no verification date.
- Effective action: outcome is Effective and a verification date and method are present.

## Daily Flow

At 6:00 AM Central:

1. Read Guest Cases, Activities, Corrective Actions and Store Directory.
2. Remove records with Exclude from Reporting = Yes and diagnostic markers.
3. Select and order columns to match the workbook tables.
4. Run the workbook refresh Office Script with the four JSON arrays.
5. Post one Teams summary only when there are repeat locations, post-action recurrences, ineffective actions or overdue verification.

