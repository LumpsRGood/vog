# Voice of the Guest Executive Demo

## Demo Links

- Guest intake: https://voiceoftheguest.com
- Staff intake: https://voiceoftheguest.com/staff
- Guest Cases: https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Lists/Guest%20Cases/AllItems.aspx
- Activities: https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Lists/Activities/AllItems.aspx
- Dashboard: https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Shared%20Documents/VOG_Demo_Dashboard.xlsx?web=1
- Teams alerts: Guest Relations > Guest Case Alerts

## Verified Demo Case

- Guest: Jordan Ellis
- Case: `VOG-81c14250b8844d0f904fe9b6ff8bbdf9`
- Store: 4463, Decatur, AL
- Contact: Email
- Scenario: Incorrect takeout order requiring restaurant follow-up
- Direct case view: https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Lists/Guest%20Cases/AllItems.aspx?FilterField1=Title&FilterValue1=VOG-81C14250B8844D0F904FE9B6FF8BBDF9

## Presentation Order

1. Submit a short report at the guest intake page. Explain that the public form standardizes the store, city, and state before submission.
2. Open Guest Relations > Guest Case Alerts in Teams. Show the single alert and use its Open case link.
3. In Guest Cases, show the complete record. Point out the automatic defaults: New status, Normal priority, Medium severity, and a two-day due date.
4. Assign the case to a staff member, set a follow-up date, and change the status to Assigned or In Progress.
5. Open Activities and add a note using the same Case ID. Demonstrate a call, email, follow-up, or internal note without overwriting prior history.
6. Return to Guest Cases, add the resolution type and summary, set the resolved date, then set the closed date when the guest relationship is complete.
7. Open the dashboard in Teams or SharePoint. Show open, overdue, resolved, closed, source, store, state, issue category, recurring issue, repeat guest, and response-time measures.
8. Close with the operating model: Microsoft Lists is the business source of truth; Supabase is the intake and delivery layer; Teams is the action surface; Excel is the initial executive reporting surface.

## Staff Operating Routine

1. Monitor Guest Case Alerts for new reports.
2. Open the case from the alert and assign an owner.
3. Record each call, email, note, assignment, and follow-up in Activities using the exact Case ID.
4. Keep Status, Priority, Follow-up Due Date, Resolution Type, Resolution Summary, Resolved Date, and Closed Date current in Guest Cases.
5. Review the Due Today and Overdue view daily.
6. Do not use test names, verification addresses, or the word DELETE in real records. Those markers are reserved for records excluded from reporting and removed after acceptance testing.

## Demo Talking Points

- Every intake avenue ends in one Guest Cases dataset.
- Store metadata is standardized before it reaches reporting.
- Teams gives staff an immediate action path without becoming the database.
- Activities preserves a permanent chronological history while Guest Cases holds the current state.
- The dashboard can later move to Power BI without replacing the Lists operating model.

## Current Pilot Boundary

The production guest intake, staff intake, Guest Cases creation, default values, Teams alert, and Activities synchronization are live. The consolidated overdue message, Adaptive Card alert, and scheduled dashboard refresh still require their Power Automate flows to be saved and tested in the Microsoft designer before the pilot is considered fully operational.

Verified activity bridge record: `demo-activity-20260802-2`, attached to the executive demo case. The earlier `AID` row is a mapping diagnostic and must remain excluded from reporting.
