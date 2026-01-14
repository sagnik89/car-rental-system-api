# Car Rental System API

A production-style REST API for a **Car Rental System**, built using **Node.js**, **Express**, **PostgreSQL**, **JWT-based authentication** and **Error Handling with ZOD**.

The system supports secure user authentication and end-to-end booking management with strict authorization, ownership enforcement, and consistent API contracts.

---

## Objectives

This project demonstrates:

- Relational database modeling with PostgreSQL
- Secure authentication using JWT
- Authorization and resource ownership checks
- Predictable, clean REST API design
- Consistent error handling
- Readiness for automated and test-driven development

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Error Handling:** zod

---

## Database Design

### Users Table

```sql
CREATE TABLE users (
  id SERIALPRIMARY KEY,
  username TEXTUNIQUENOT NULL,
  password TEXTNOT NULL,
  created_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP
);

```

### Bookings Table

```sql
CREATE TABLE bookings (
  id SERIALPRIMARY KEY,
  user_idINTEGERREFERENCES users(id)ONDELETE CASCADE,
  car_name TEXTNOT NULL,
  daysINTEGERNOT NULL,
  rent_per_dayINTEGERNOT NULL,
  status TEXTCHECK (statusIN ('booked','completed','cancelled'))NOT NULL,
  created_atTIMESTAMPDEFAULTCURRENT_TIMESTAMP
);

```

### Constraints

- No field allows `NULL`
- Each booking is owned by exactly one user
- Booking status is restricted to predefined values

---

## Authentication & Authorization

### JWT Rules

- JWTs are issued **only after successful login**
- Token payload:

```json
{
"userId":1,
"username":"rahul"
}

```

- JWT must be provided via request header:

```
Authorization: Bearer <JWT_TOKEN>

```

- All `/bookings` endpoints are protected and require a valid token

---

## Error Handling Standard

All error responses strictly follow this format:

```json
{
"success":false,
"error":"error description"
}

```

This ensures predictable client-side error handling and test assertions.

---

## Authentication Middleware

### `authMiddleware`

### Responsibilities

1. Validate presence of `Authorization` header
2. Extract and verify JWT
3. Attach authenticated user information to the request object

```jsx
req.user = {
userId:1,
username:"rahul"
};

```

### Failure Scenarios

| HTTP Status | Description |
| --- | --- |
| 401 | Authorization header missing |
| 401 | Bearer token missing |
| 401 | Invalid or expired token |

---

## API Endpoints

### 1. POST `/auth/signup`

Creates a new user account.

**Request Body**

```json
{
"username":"rahul",
"password":"123"
}

```

**Success — 201 Created**

```json
{
"success":true,
"data":{
"message":"User created successfully",
"userId":1
}
}

```

**Errors**

| Status | Reason |
| --- | --- |
| 400 | Invalid input payload |
| 409 | Username already exists |

---

### 2. POST `/auth/login`

Authenticates a user and issues a JWT.

**Request Body**

```json
{
"username":"rahul",
"password":"123"
}

```

**Success — 200 OK**

```json
{
"success":true,
"data":{
"message":"Login successful",
"token":"<jwt_token>"
}
}

```

**Errors**

| Status | Reason |
| --- | --- |
| 400 | Invalid input payload |
| 401 | User not found |
| 401 | Incorrect password |

---

### 3. POST `/bookings`

Creates a booking for the authenticated user.

**Request Body**

```json
{
"carName":"Honda City",
"days":3,
"rentPerDay":1500
}

```

### Business Rules

- Initial status is always `"booked"`
- `totalCost = days × rentPerDay`
- `days` must be `< 365`
- `rentPerDay` must be `≤ 2000`

**Success — 201 Created**

```json
{
"success":true,
"data":{
"message":"Booking created successfully",
"bookingId":101,
"totalCost":4500
}
}

```

**Errors**

| Status | Reason |
| --- | --- |
| 400 | Invalid input or rule violation |

---

### 4. GET `/bookings`

Fetch bookings belonging to the authenticated user.

### Query Parameters

- `bookingId` → Fetch a specific booking
- `summary=true` → Fetch booking summary

---

### Standard Response — 200 OK

```json
{
"success":true,
"data":[
{
"id":101,
"car_name":"Honda City",
"days":3,
"rent_per_day":1500,
"status":"booked",
"totalCost":4500
}
]
}
```

---

### Summary Response — 200 OK

```json
{
"success":true,
"data":{
"userId":1,
"username":"rahul",
"totalBookings":3,
"totalAmountSpent":6300
}
}

```

**Summary Rules**

- Includes only `booked` and `completed` bookings
- Excludes `cancelled` bookings

**Errors**

| Status | Reason |
| --- | --- |
| 404 | Booking not found |

---

### 5. PUT `/bookings/:bookingId`

Updates booking details or booking status.

**Authorization**

- Only the booking owner may perform updates

---

### Update Booking Details

```json
{
"carName":"Verna",
"days":4,
"rentPerDay":1600
}

```

### Update Status Only

```json
{
"status":"completed"
}

```

---

**Success — 200 OK**

```json
{
"success":true,
"data":{
"message":"Booking updated successfully",
"booking":{
"id":101,
"car_name":"Verna",
"days":4,
"rent_per_day":1600,
"status":"completed",
"totalCost":6400
}
}
}

```

**Errors**

| Status | Reason |
| --- | --- |
| 400 | Invalid input |
| 403 | Booking does not belong to user |
| 404 | Booking not found |

---

### 6. DELETE `/bookings/:bookingId`

Deletes a booking owned by the authenticated user.

**Success — 200 OK**

```json
{
"success":true,
"data":{
"message":"Booking deleted successfully"
}
}

```

**Errors**

| Status | Reason |
| --- | --- |
| 403 | Booking does not belong to user |
| 404 | Booking not found |