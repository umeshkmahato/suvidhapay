# Phase 1 Validation Checklist

Use this checklist to confirm the Municipal Collection Management System Phase 1 deliverables are complete.

## Authentication

- [ ] Admin user can login from the UI
- [ ] Agent user can login from the UI
- [ ] Access token is stored after login
- [ ] Refresh token is stored after login
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Role information is available in the authenticated user payload

## Vehicle Registration

- [ ] Vehicle registration form is visible on the dashboard
- [ ] `vehicle_number` is mandatory
- [ ] `vehicle_number` is unique
- [ ] `mobile_number` accepts valid 10-digit Indian mobile numbers only
- [ ] Category options are limited to `auto`, `e_rickshaw`, and `hawker`
- [ ] Status options are limited to `active` and `inactive`
- [ ] New vehicle persists in PostgreSQL

## Vehicle Search

- [ ] Search works by vehicle number
- [ ] Search works by mobile number
- [ ] Search result displays owner name
- [ ] Search result displays category
- [ ] Search result displays active/inactive status
- [ ] Empty search request is rejected with validation error

## Vehicle Listing

- [ ] Listing endpoint returns paginated data
- [ ] UI shows current page and total pages
- [ ] Text search works in listing
- [ ] Category filter works in listing
- [ ] Status filter works in listing
- [ ] Previous/Next pagination controls work correctly

## Database

- [ ] PostgreSQL schema contains `users` table
- [ ] PostgreSQL schema contains `vehicles` table
- [ ] Seeded admin user exists
- [ ] Seeded agent user exists
- [ ] Sample vehicle data exists
- [ ] Schema migration can be rerun safely
- [ ] Seed script can be rerun safely

## Docker / Deployment

- [ ] `postgres` container becomes healthy
- [ ] `api` container becomes healthy
- [ ] `web` container starts successfully
- [ ] API is reachable at the configured host port
- [ ] Frontend is reachable at the configured host port
- [ ] API container auto-runs migration on startup
- [ ] API container auto-runs seed on startup

## Acceptance Criteria Mapping

- [ ] Login works
- [ ] Vehicle registration works
- [ ] Duplicate vehicle not allowed
- [ ] Search returns data correctly
- [ ] Pagination implemented
- [ ] Docker containers run successfully

