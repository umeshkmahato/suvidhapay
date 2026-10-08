# SuvidhaPay API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "9876543210",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securePassword123",
  "role": "collector"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "collector",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "role": "collector"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## User Endpoints

### Get All Users
**GET** `/users?limit=10&offset=0`

Requires: `admin` or `officer` role

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "phone": "9876543210",
      "first_name": "John",
      "last_name": "Doe",
      "role": "collector",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

---

### Get User by ID
**GET** `/users/:id`

Get details of a specific user.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone": "9876543210",
  "first_name": "John",
  "last_name": "Doe",
  "role": "collector",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Update User
**PUT** `/users/:id`

Update user information.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "9876543211",
  "is_active": true
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": { /* updated user object */ }
}
```

---

### Delete User
**DELETE** `/users/:id`

Requires: `admin` role

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Vendor Endpoints

### Create Vendor
**POST** `/vendors`

Requires: `admin` or `collector` role

**Request Body:**
```json
{
  "name": "Rajesh Auto",
  "vendor_type": "auto",
  "phone": "9988776655",
  "registration_number": "AUTO-001",
  "email": "rajesh@email.com",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "license_number": "LIC-001",
  "license_expiry": "2025-12-31"
}
```

**Response (201):**
```json
{
  "message": "Vendor created successfully",
  "vendor": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Rajesh Auto",
    "vendor_type": "auto",
    "phone": "9988776655",
    "registration_number": "AUTO-001",
    "status": "active",
    "outstanding_amount": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get All Vendors
**GET** `/vendors?limit=10&offset=0&vendor_type=auto`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `vendor_type` (optional): Filter by type (auto, e_rickshaw, hawker, vendor)

**Response (200):**
```json
{
  "vendors": [ /* array of vendor objects */ ],
  "limit": 10,
  "offset": 0
}
```

---

### Get Vendor by ID
**GET** `/vendors/:id`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Rajesh Auto",
  "vendor_type": "auto",
  /* ... other vendor fields ... */
}
```

---

### Update Vendor
**PUT** `/vendors/:id`

Requires: `admin` or `collector` role

**Request Body:**
```json
{
  "phone": "9988776656",
  "address": "456 New St",
  "status": "active"
}
```

**Response (200):**
```json
{
  "message": "Vendor updated successfully",
  "vendor": { /* updated vendor object */ }
}
```

---

### Delete Vendor
**DELETE** `/vendors/:id`

Requires: `admin` role

**Response (200):**
```json
{
  "message": "Vendor deleted successfully"
}
```

---

## Collection Endpoints

### Create Collection
**POST** `/collections`

Requires: `admin` or `collector` role

**Request Body:**
```json
{
  "vendor_id": "550e8400-e29b-41d4-a716-446655440001",
  "collection_date": "2024-01-15",
  "amount_due": 500,
  "amount_collected": 500,
  "payment_method": "cash",
  "notes": "Collection completed"
}
```

**Response (201):**
```json
{
  "message": "Collection recorded successfully",
  "collection": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "vendor_id": "550e8400-e29b-41d4-a716-446655440001",
    "collector_id": "550e8400-e29b-41d4-a716-446655440000",
    "collection_date": "2024-01-15",
    "amount_due": 500,
    "amount_collected": 500,
    "payment_status": "pending",
    "collection_status": "scheduled",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get All Collections
**GET** `/collections?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Response (200):**
```json
{
  "collections": [ /* array of collection objects */ ],
  "limit": 10,
  "offset": 0
}
```

---

### Get Collection by ID
**GET** `/collections/:id`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "vendor_id": "550e8400-e29b-41d4-a716-446655440001",
  /* ... other collection fields ... */
}
```

---

### Get Collections by Vendor
**GET** `/vendors/:vendorId/collections?limit=10&offset=0`

Get all collections for a specific vendor.

**Response (200):**
```json
{
  "collections": [ /* array of collection objects for the vendor */ ],
  "limit": 10,
  "offset": 0
}
```

---

### Update Collection
**PUT** `/collections/:id`

Requires: `admin` or `collector` role

**Request Body:**
```json
{
  "amount_collected": 500,
  "payment_status": "completed",
  "collection_status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Collection updated successfully",
  "collection": { /* updated collection object */ }
}
```

---

### Delete Collection
**DELETE** `/collections/:id`

Requires: `admin` role

**Response (200):**
```json
{
  "message": "Collection deleted successfully"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - User lacks permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Header**: `X-RateLimit-Remaining` shows remaining requests

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "9876543210",
    "first_name": "Test",
    "last_name": "User",
    "password": "Test@123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

### Get Users (with token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Version History

- **v1.0.0** - Initial API release with authentication, user, vendor, and collection management
