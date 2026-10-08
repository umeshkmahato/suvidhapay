# Phase 2 Testing Checklist

Use this checklist after migrations and seed data have run.

Seeded login:

- Admin: `admin@municipal.com` / `Admin@123`
- Agent: `agent@municipal.com` / `Admin@123`

Seeded rates, if none exist yet: Auto Rs 50, E-Rickshaw Rs 30, Hawker Rs 20.

## Acceptance

- [ ] Due creation works
- [ ] Outstanding calculation is accurate
- [ ] Vehicle-wise due tracking works
- [ ] Historical records are retained

## Rate Master

- [ ] TC-RATE-001 Admin can open Rate Master and see Auto, E-Rickshaw, and Hawker amounts
- [ ] TC-RATE-002 Saving Rs 60 for Auto returns the new active rate
- [ ] TC-RATE-003 The previous Auto rate remains in history with `is_active = false`
- [ ] TC-RATE-004 Agent cannot call `PUT /api/rate-master` (`403`)
- [ ] TC-RATE-005 Amount `0` or a negative amount is rejected
- [ ] TC-RATE-006 A category cannot be sent twice in one save

## Due creation

- [ ] TC-DUE-001 Admin creates a due for an active auto with only vehicle and due date
- [ ] TC-DUE-002 Saved amount equals the active Auto rate, not a typed amount
- [ ] TC-DUE-003 API returns `201` and the due appears in the dues list and vehicle detail
- [ ] TC-DUE-004 Creating a second open due for the same vehicle and date returns `409`
- [ ] TC-DUE-005 Creating a due when that category has no active rate is rejected
- [ ] TC-DUE-006 Creating a due for an inactive vehicle is rejected
- [ ] TC-DUE-007 Agent cannot create, edit, or cancel a due (`403`)
- [ ] TC-DUE-008 Missing vehicle or invalid date returns `400`
- [ ] TC-DUE-009 Partial status without a paid amount is rejected
- [ ] TC-DUE-010 Paid status stores `paid_amount` equal to `amount`

## Edit and cancel

- [ ] TC-DUE-011 Admin can edit due date, amount, and status
- [ ] TC-DUE-012 Edited amount does not change other dues for the same vehicle
- [ ] TC-DUE-013 Cancel sets status to `cancelled` and keeps the row
- [ ] TC-DUE-014 Cancelled due cannot be edited
- [ ] TC-DUE-015 Cancelling an already cancelled due is rejected
- [ ] TC-DUE-016 After cancel, a new due can be created for the same vehicle and date

## Outstanding calculation

Use this example:

| Due | Amount | Paid | Status | Counted |
| --- | --- | --- | --- | --- |
| 1 | 50 | 0 | pending | yes |
| 2 | 50 | 50 | paid | yes |
| 3 | 30 | 10 | partial | yes |
| 4 | 20 | 0 | cancelled | no |

- [ ] TC-BAL-001 Total Due is 130
- [ ] TC-BAL-002 Total Paid is 60
- [ ] TC-BAL-003 Outstanding Balance is 70
- [ ] TC-BAL-004 `GET /api/dues/outstanding?vehicle_id=<id>` matches the vehicle detail screen
- [ ] TC-BAL-005 Vehicle list outstanding matches the detail screen for that vehicle
- [ ] TC-BAL-006 A status filter on the dues list does not hide cancelled rows from the stored history, and cancelled rows stay out of the balance
- [ ] TC-BAL-007 Changing the category rate does not change outstanding on dues already created

## Vehicle detail

- [ ] TC-VEH-DETAIL-001 Opening a vehicle shows number, owner, mobile, category, address, and status
- [ ] TC-VEH-DETAIL-002 The screen shows the current category rate
- [ ] TC-VEH-DETAIL-003 Due history includes pending, paid, partial, and cancelled rows
- [ ] TC-VEH-DETAIL-004 Outstanding on the screen matches Total Due - Total Paid
- [ ] TC-VEH-DETAIL-005 Admin can jump from the detail screen to create a due for that vehicle
- [ ] TC-VEH-DETAIL-006 Unknown vehicle id returns `404`

## Access and regression

- [ ] TC-AUTH-001 Unauthenticated `GET /api/dues` returns `401`
- [ ] TC-AUTH-002 Phase 1 login, vehicle registration, search, and listing still work
- [ ] TC-AUTH-003 Invalid UUID path params return `400`

