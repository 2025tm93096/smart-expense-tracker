# Database Schema — Smart Expense Tracker

MongoDB (via Mongoose). All collections use `_id` (ObjectId) as primary key and include `createdAt` / `updatedAt` timestamps automatically.

---

## Collections Overview

```
┌──────────────────────────────────────────────────────────────┐
│  users          expenses         budgets         splits       │
│  ───────        ────────         ───────         ──────       │
│  _id ◄──────── user (ref)        user (ref)      creator(ref)│
│  username       category         category        description  │
│  password       amount           monthlyLimit    totalAmount  │
│  purpose        date             createdAt       members[]    │
│  purposeNote    toUser           updatedAt       createdAt    │
│  mobile         recurring                        updatedAt    │
│  createdAt      createdAt                                     │
│  updatedAt      updatedAt                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## User

**Collection:** `users`

| Field         | Type     | Required | Constraints                                                                  |
| ------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `_id`         | ObjectId | auto     | Primary key                                                                  |
| `username`    | String   | ✅       | unique, trim, 3–30 chars                                                     |
| `password`    | String   | ✅       | bcrypt hashed, min 6 chars                                                   |
| `purpose`     | String   | ❌       | enum: Personal / Retail Shop / Trip / Petrol / Other, default: Personal      |
| `purposeNote` | String   | ❌       | max 200 chars, default: ""                                                   |
| `mobile`      | String   | ✅       | required, with country code e.g. +919876543210, used for split bill matching |
| `createdAt`   | Date     | auto     |                                                                              |
| `updatedAt`   | Date     | auto     |                                                                              |

**Indexes:**

- `username` — unique index (enforced by Mongoose)

**Notes:**

- Password is hashed using bcryptjs with 12 salt rounds before saving (`pre('save')` hook)
- `purposeNote` is only meaningful when `purpose = "Other"`

---

## Expense

**Collection:** `expenses`

| Field       | Type     | Required | Constraints                                                  |
| ----------- | -------- | -------- | ------------------------------------------------------------ |
| `_id`       | ObjectId | auto     | Primary key                                                  |
| `user`      | ObjectId | ✅       | ref: User                                                    |
| `category`  | String   | ✅       | trim, max 50 chars                                           |
| `amount`    | Number   | ✅       | min 0                                                        |
| `date`      | String   | ✅       | format: YYYY-MM-DD                                           |
| `toUser`    | String   | ❌       | set when created via split bill payment; trim, default: null |
| `recurring` | Boolean  | ❌       | default: false                                               |
| `createdAt` | Date     | auto     |                                                              |
| `updatedAt` | Date     | auto     |                                                              |

**Notes:**

- Expenses where `toUser` is not null are created automatically when a split bill member marks themselves as paid — these cannot be manually edited or deleted
- Sorted by `date: -1` on all fetch queries

---

## Budget

**Collection:** `budgets`

| Field          | Type     | Required | Constraints        |
| -------------- | -------- | -------- | ------------------ |
| `_id`          | ObjectId | auto     | Primary key        |
| `user`         | ObjectId | ✅       | ref: User          |
| `category`     | String   | ✅       | trim, max 50 chars |
| `monthlyLimit` | Number   | ✅       | min 1              |
| `createdAt`    | Date     | auto     |                    |
| `updatedAt`    | Date     | auto     |                    |

**Indexes:**

- `{ user: 1, category: 1 }` — unique compound index (one budget per category per user)

**Notes:**

- Budget creation uses `findOneAndUpdate` with `upsert: true` — so POST /budgets is idempotent (creates or updates)

---

## Split

**Collection:** `splits`

| Field         | Type           | Required | Constraints                      |
| ------------- | -------------- | -------- | -------------------------------- |
| `_id`         | ObjectId       | auto     | Primary key                      |
| `creator`     | ObjectId       | ✅       | ref: User                        |
| `description` | String         | ✅       | trim, max 100 chars              |
| `note`        | String         | ❌       | trim, max 200 chars, default: "" |
| `totalAmount` | Number         | ✅       | min 0                            |
| `members`     | [MemberSchema] | ✅       | 1–20 members                     |
| `createdAt`   | Date           | auto     |                                  |
| `updatedAt`   | Date           | auto     |                                  |

### Embedded: Member (sub-document)

| Field     | Type     | Required | Constraints                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `_id`     | ObjectId | auto     | Sub-document ID                               |
| `name`    | String   | ✅       | trim, max 50 chars                            |
| `mobile`  | String   | ✅       | full number with country code                 |
| `share`   | Number   | ✅       | auto-calculated: totalAmount / members.length |
| `settled` | Boolean  | ❌       | default: false                                |

**Notes:**

- Members are embedded (not referenced) since they are always fetched with the split
- Member matching for incoming splits is done by mobile number against the logged-in user's `mobile` field
- When a member pays, an Expense record is created for them with `category: "Split Bill"` and `toUser: <creator_username>`

---

## Entity Relationship Diagram (text)

```
┌─────────┐         ┌──────────┐
│  users  │ 1     * │ expenses │
│         ├─────────┤          │
│ _id     │         │ user     │ (ObjectId ref)
│ username│         │ category │
│ mobile  │         │ amount   │
└────┬────┘         │ date     │
     │              │ toUser   │
     │              └──────────┘
     │
     │ 1     *  ┌──────────┐
     ├──────────┤ budgets  │
     │          │          │
     │          │ user     │ (ObjectId ref)
     │          │ category │
     │          │ limit    │
     │          └──────────┘
     │
     │ 1     *  ┌──────────────────────────┐
     └──────────┤ splits                   │
                │                          │
                │ creator  (ObjectId ref)  │
                │ description              │
                │ totalAmount              │
                │ members[] (embedded)     │
                │   ├─ name               │
                │   ├─ mobile             │
                │   ├─ share              │
                │   └─ settled            │
                └──────────────────────────┘
```
