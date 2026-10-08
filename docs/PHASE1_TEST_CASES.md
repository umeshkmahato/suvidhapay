# Phase 1 Test Cases

These test cases cover the Phase 1 Municipal Collection Management System scope:

- Authentication
- Vehicle registration
- Duplicate prevention
- Vehicle search
- Vehicle listing with pagination/filtering
- Docker bootstrap

## Seeded credentials

- Admin: `admin@municipal.com` / `Admin@123`
- Agent: `agent@municipal.com` / `Admin@123`

## Authentication

### TC-AUTH-001 Admin login succeeds
**Precondition:** Database migrated and seeded.

**Steps:**
1. Open the web app.
2. Login with admin credentials.

**Expected Result:**
- Login succeeds.
- JWT access and refresh tokens are returned.
- User lands on the dashboard.
- User role displays as `Admin`.

### TC-AUTH-002 Agent login succeeds
**Steps:**
1. Login with agent credentials.

**Expected Result:**
- Login succeeds.
- Dashboard loads.
- User role displays as `Agent`.

### TC-AUTH-003 Invalid password is rejected
**Steps:**
1. Attempt login with a valid email and invalid password.

**Expected Result:**
- API returns `401`.
- UI shows `Invalid email or password`.

### TC-AUTH-004 Protected API requires JWT
**Steps:**
1. Call `GET /api/vehicles` without `Authorization` header.

**Expected Result:**
- API returns `401` with `Access token required`.

## Vehicle Registration

### TC-VEH-001 Register vehicle with valid data
**Sample Payload:**
```json
{
  "vehicle_number": "MH14ZX4321",
  "owner_name": "Suresh Patil",
  "mobile_number": "9876543222",
  "category": "auto",
  "address": "Ward 2, Pune",
  "status": "active"
}
```

**Expected Result:**
- API returns `201`.
- Vehicle is saved.
- Vehicle appears in listing.

### TC-VEH-002 Vehicle number is mandatory
**Steps:**
1. Submit registration without `vehicle_number`.

**Expected Result:**
- API returns `400`.
- Validation message says vehicle number is required.

### TC-VEH-003 Duplicate vehicle number is blocked
**Precondition:** Vehicle `MH12AB1234` exists.

**Steps:**
1. Submit a new vehicle with `vehicle_number = MH12AB1234`.

**Expected Result:**
- API returns `409`.
- UI/API shows `Vehicle number already exists`.

### TC-VEH-004 Mobile number format is validated
**Steps:**
1. Submit registration with `mobile_number = 12345`.

**Expected Result:**
- API returns `400`.
- Validation message says the mobile number must be a valid 10-digit Indian number.

### TC-VEH-005 Vehicle number normalization prevents formatted duplicates
**Steps:**
1. Create a vehicle with `MH14ZX4321`.
2. Try again with `mh14 zx 4321`.

**Expected Result:**
- Second request is rejected as duplicate.

## Vehicle Search

### TC-SEARCH-001 Search by vehicle number
**Steps:**
1. Search using an existing vehicle number.

**Expected Result:**
- Matching record is returned.
- UI shows owner name, category, and status.

### TC-SEARCH-002 Search by mobile number
**Steps:**
1. Search using an existing mobile number.

**Expected Result:**
- Matching vehicle records are returned.

### TC-SEARCH-003 Search requires at least one identifier
**Steps:**
1. Trigger search with both search inputs empty.

**Expected Result:**
- API returns `400`.
- Validation error is returned.

## Vehicle Listing

### TC-LIST-001 Default listing loads first page
**Steps:**
1. Open dashboard.

**Expected Result:**
- First page of vehicles loads.
- Pagination metadata is returned.

### TC-LIST-002 Listing supports free-text search
**Steps:**
1. Search with a known owner name or vehicle number in list filters.

**Expected Result:**
- Matching rows are shown.

### TC-LIST-003 Listing supports category filter
**Steps:**
1. Select category `hawker`.

**Expected Result:**
- Only hawker rows are shown.

### TC-LIST-004 Listing supports status filter
**Steps:**
1. Select status `inactive`.

**Expected Result:**
- Only inactive rows are shown.

### TC-LIST-005 Pagination navigation works
**Precondition:** More than 10 vehicles exist.

**Steps:**
1. Click `Next`.
2. Click `Previous`.

**Expected Result:**
- Page number changes correctly.
- Returned rows correspond to the selected page.

## Docker / Environment

### TC-DOCKER-001 Fresh stack boots successfully
**Steps:**
1. Run the local compose stack from a clean state.

**Expected Result:**
- PostgreSQL becomes healthy.
- API becomes healthy.
- Web container starts.
- Schema migration runs automatically.
- Seed data is inserted automatically.

### TC-DOCKER-002 Restart is safe
**Steps:**
1. Restart the API container or rerun compose up.

**Expected Result:**
- Migration reruns safely.
- Seed reruns safely without duplicate key failures.
- App remains usable.

