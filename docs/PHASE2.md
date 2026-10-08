# Phase 2: Rate Master and Dues

Phase 2 replaces manual due calculations. An admin configures one rupee amount per vehicle category. Creating a due copies that amount onto the due, so later rate changes do not rewrite history.

## Database

Migration: `SuvidhaPay-api/database/migrations/002_phase2_dues.sql`

### `rate_master`

| Column | Notes |
| --- | --- |
| `category` | `auto`, `e_rickshaw`, or `hawker` |
| `amount` | Rs amount used for new dues |
| `effective_from` / `effective_to` | Active window |
| `is_active` | Only one active row per category |

Changing a rate closes the previous row and inserts a new active row.

### `dues`

| Column | Notes |
| --- | --- |
| `vehicle_id` | Vehicle the charge belongs to |
| `rate_master_id` | Rate row used when the due was created |
| `due_date` | Charge date |
| `amount` | Snapshotted rate, editable later by an admin |
| `paid_amount` | Amount already collected against this due |
| `status` | `pending`, `partial`, `paid`, or `cancelled` |

Cancelled rows stay in the table. They are excluded from totals. An open due is unique per vehicle and date.

Outstanding for a vehicle:

- Total Due = sum of `amount` where status is not `cancelled`
- Total Paid = sum of `paid_amount` where status is not `cancelled`
- Outstanding Balance = Total Due - Total Paid

## APIs

All routes require `Authorization: Bearer <token>`.

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/rate-master` | Admin, agent | Current rates and history |
| `PUT` | `/api/rate-master` | Admin | Save one rate or `{ rates: [...] }` |
| `POST` | `/api/dues` | Admin | Create a due. Amount comes from the active category rate |
| `GET` | `/api/dues` | Admin, agent | List dues. Response includes `outstanding` |
| `GET` | `/api/dues/:id` | Admin, agent | One due |
| `PUT` | `/api/dues/:id` | Admin | Edit vehicle, date, amount, status, or paid amount |
| `POST` | `/api/dues/:id/cancel` | Admin | Cancel without deleting |
| `GET` | `/api/dues/outstanding` | Admin, agent | Summary plus vehicle-wise balances |
| `GET` | `/api/vehicles/:id` | Admin, agent | Vehicle, current rate, outstanding, due history |
| `GET` | `/api/vehicles/options` | Admin, agent | Vehicle dropdown |

Create due body:

```json
{
  "vehicle_id": "uuid",
  "due_date": "2026-10-08",
  "status": "pending"
}
```

`status` may be `pending`, `partial`, or `paid`. Partial requires `paid_amount`.

Seeded rates, inserted only when a category has no active rate:

- Auto: Rs 50
- E-Rickshaw: Rs 30
- Hawker: Rs 20

## UI

After login:

- Vehicles: existing registry, plus outstanding and a vehicle detail link
- Rate Master: admin only
- Dues: create, edit, cancel, and vehicle-wise outstanding
- Vehicle detail: vehicle information, due history, outstanding amount

