# API Documentation — Smart Expense Tracker

Base URL (production): `https://smart-expense-tracker-backend.onrender.com`  
Base URL (local): `http://localhost:5000`

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth

### POST `/signup`

Register a new user.

**Rate limited:** 50 requests / 15 min

**Request body:**

```json
{
  "username": "john_doe",
  "password": "secret123",
  "purpose": "Personal",
  "purposeNote": "",
  "mobile": "+919876543210"
}
```

| Field       | Type   | Required | Rules                                                           |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| username    | string | ✅       | 3–30 chars, unique                                              |
| password    | string | ✅       | min 6 chars                                                     |
| purpose     | string | ❌       | `Personal` \| `Retail Shop` \| `Trip` \| `Petrol` \| `Other`    |
| purposeNote | string | ❌       | max 200 chars, only used when purpose = "Other"                 |
| mobile      | string | ✅       | required, format: `+<countrycode><number>` e.g. `+919876543210` |

**Responses:**

| Status | Body                                            |
| ------ | ----------------------------------------------- |
| 201    | `{ "message": "Account created successfully" }` |
| 400    | `{ "message": "<validation error>" }`           |
| 409    | `{ "message": "Username already taken" }`       |

---

### POST `/login`

Authenticate and receive a JWT token.

**Rate limited:** 50 requests / 15 min

**Request body:**

```json
{
  "username": "john_doe",
  "password": "secret123"
}
```

**Responses:**

| Status | Body                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| 200    | `{ "token": "<jwt>", "username": "john_doe", "purpose": "Personal", "mobile": "+91..." }` |
| 400    | `{ "message": "<validation error>" }`                                                     |
| 401    | `{ "message": "Invalid password" }`                                                       |
| 404    | `{ "message": "User not found" }`                                                         |

---

### GET `/me` 🔒

Get the currently logged-in user's profile.

**Responses:**

| Status | Body                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| 200    | `{ "_id": "...", "username": "john_doe", "purpose": "Personal", "mobile": "+91..." }` |
| 401    | `{ "message": "No token provided" }`                                                  |

---

## Expenses 🔒

All expense routes require authentication.

### GET `/expenses`

Get all expenses for the authenticated user, sorted by date descending.

**Response 200:**

```json
[
  {
    "_id": "664abc...",
    "user": "663xyz...",
    "category": "Food",
    "amount": 250,
    "date": "2026-04-20",
    "toUser": null,
    "recurring": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### POST `/expenses/add`

Add a new expense.

**Request body:**

```json
{
  "category": "Food",
  "amount": 250.0,
  "date": "2026-04-20",
  "recurring": false
}
```

| Field     | Type    | Required | Rules                |
| --------- | ------- | -------- | -------------------- |
| category  | string  | ✅       | max 50 chars         |
| amount    | number  | ✅       | min 0                |
| date      | string  | ✅       | format: `YYYY-MM-DD` |
| recurring | boolean | ❌       | default: false       |

**Responses:**

| Status | Body                                  |
| ------ | ------------------------------------- |
| 201    | Created expense object                |
| 400    | `{ "message": "<validation error>" }` |

---

### PUT `/expenses/:id`

Update an existing expense.

> ⚠️ Split-paid expenses (where `toUser` is set) cannot be edited.

**Request body:** same as POST `/expenses/add`

**Responses:**

| Status | Body                                                    |
| ------ | ------------------------------------------------------- |
| 200    | Updated expense object                                  |
| 400    | Validation error                                        |
| 403    | `{ "message": "Split-paid expenses cannot be edited" }` |
| 404    | `{ "message": "Expense not found" }`                    |

---

### DELETE `/expenses/:id`

Delete an expense.

> ⚠️ Split-paid expenses cannot be deleted.

**Responses:**

| Status | Body                                                     |
| ------ | -------------------------------------------------------- |
| 200    | `{ "message": "Deleted" }`                               |
| 403    | `{ "message": "Split-paid expenses cannot be deleted" }` |
| 404    | `{ "message": "Expense not found" }`                     |

---

## Budgets 🔒

### GET `/budgets`

Get all monthly budgets for the current user.

**Response 200:**

```json
[
  {
    "_id": "...",
    "user": "...",
    "category": "Food",
    "monthlyLimit": 5000,
    "createdAt": "..."
  }
]
```

---

### POST `/budgets`

Create or update (upsert) a monthly budget for a category.

**Request body:**

```json
{
  "category": "Food",
  "monthlyLimit": 5000
}
```

| Field        | Type   | Required | Rules                          |
| ------------ | ------ | -------- | ------------------------------ |
| category     | string | ✅       | must match an expense category |
| monthlyLimit | number | ✅       | min 1                          |

**Response 201:** Budget object (created or updated)

---

### DELETE `/budgets/:id`

Remove a category budget.

**Response 200:** `{ "message": "Deleted" }`

---

## Split Bills 🔒

### GET `/splits`

Get all splits created by the current user.

**Response 200:**

```json
[
  {
    "_id": "...",
    "creator": "...",
    "description": "Goa Trip",
    "note": "Hotel + food",
    "totalAmount": 12000,
    "members": [
      {
        "_id": "...",
        "name": "Alice",
        "mobile": "+919000000001",
        "share": 4000,
        "settled": false
      },
      {
        "_id": "...",
        "name": "Bob",
        "mobile": "+919000000002",
        "share": 4000,
        "settled": true
      }
    ],
    "createdAt": "..."
  }
]
```

---

### GET `/splits/incoming`

Get splits where the current user is a member (matched by mobile number) and has not settled yet.

**Response 200:** Array of split objects (with `creator` populated as `{ username }`)

---

### POST `/splits`

Create a new bill split.

**Request body:**

```json
{
  "description": "Goa Trip",
  "note": "Hotel + food",
  "totalAmount": 12000,
  "members": [
    { "name": "Alice", "mobile": "+919000000001" },
    { "name": "Bob", "mobile": "+919000000002" },
    { "name": "Me", "mobile": "+919000000003" }
  ]
}
```

| Field            | Type   | Required | Rules                         |
| ---------------- | ------ | -------- | ----------------------------- |
| description      | string | ✅       | max 100 chars                 |
| note             | string | ❌       | max 200 chars                 |
| totalAmount      | number | ✅       | min 0.01                      |
| members          | array  | ✅       | 1–20 members                  |
| members[].name   | string | ✅       |                               |
| members[].mobile | string | ✅       | full number with country code |

> The `share` per member is automatically calculated as `totalAmount / members.length`.

**Response 201:** Created split object

---

### PATCH `/splits/:id/settle/:memberId`

Toggle settled status of a specific member in a split (creator only).

**Response 200:** Updated split object

---

### PATCH `/splits/:id/pay`

Current user marks their own entry as paid (matched by mobile number). Also creates an expense entry of category "Split Bill" for the user.

**Response 200:** `{ "message": "Marked as paid", "split": { ... } }`

---

## Health Check

### GET `/health`

Check if the server is running.

**Response 200:** `{ "status": "ok" }`

---

## Error Format

All error responses follow:

```json
{ "message": "Human-readable error description" }
```

## HTTP Status Codes Used

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 200  | Success                                   |
| 201  | Created                                   |
| 400  | Validation / bad request                  |
| 401  | Unauthenticated (missing/invalid token)   |
| 403  | Forbidden (authenticated but not allowed) |
| 404  | Resource not found                        |
| 409  | Conflict (e.g. duplicate username)        |
| 429  | Rate limit exceeded                       |
| 500  | Internal server error                     |
