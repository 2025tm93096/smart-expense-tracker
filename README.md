# 💰 Smart Expense Tracker

A full-stack personal finance web application built with **React** (frontend) and **Node.js / Express / MongoDB** (backend). Track expenses, set monthly budgets, split bills with friends, and visualise spending — all in one place with dark mode support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Security](#security)
- [Screenshots](#screenshots)

---

## Features

### Authentication

- User signup and login with hashed passwords (bcryptjs, salt rounds: 12)
- JWT-based authentication with protected routes
- User profile: username, purpose, optional mobile number

### Expense Management

- Add, edit, and delete expenses
- Categories: Food, Travel, Shopping, Entertainment, Utilities, Health, Education, Rent, Petrol, Split Bill, Other (+ custom)
- Recurring monthly expense flag
- Filter by month, category, and search query
- Paginated expense table (10 per page), sorted by date descending
- Export filtered expenses to CSV

### Budget Tracking

- Set a monthly spending limit per category
- Visual progress bars showing spend vs. limit
- Colour-coded warnings: green (safe) → orange (≥80%) → red (exceeded)
- Edit the monthly limit directly from the category popup

### Spending Analytics

- Interactive Pie chart (Chart.js) — click any slice to drill into that category
- Category legend sorted by highest spend first
- Category drill-down popup: full expense list + budget warning banner

### Split Bills

- Create a bill split with up to 20 members (name + country code + mobile)
- Automatically calculates each member's share
- Incoming split requests notification badge on dashboard
- Mark individual members as settled
- Support for adding yourself to a split

### UI / UX

- Fully responsive — mobile and desktop layouts
- Dark / Light mode toggle (persisted via context)
- Add Expense as an in-page popup modal (no navigation away from dashboard)
- Soothing colour palette with smooth transitions

---

## Tech Stack

### Frontend

| Library                    | Purpose                  |
| -------------------------- | ------------------------ |
| React 19                   | UI framework             |
| React Router DOM 7         | Client-side routing      |
| Chart.js + react-chartjs-2 | Pie chart visualisation  |
| Axios                      | HTTP client              |
| React Context API          | Theme (dark/light) state |

### Backend

| Library            | Purpose                               |
| ------------------ | ------------------------------------- |
| Express 4          | REST API framework                    |
| Mongoose 8         | MongoDB ODM                           |
| bcryptjs           | Password hashing                      |
| jsonwebtoken       | JWT auth tokens                       |
| helmet             | HTTP security headers                 |
| cors               | Cross-origin resource sharing         |
| express-rate-limit | Brute-force protection on auth routes |
| express-validator  | Input validation                      |
| dotenv             | Environment variable loading          |

---

## Project Structure

```
smart-expense-tracker/
│
├── backend/
│   ├── server.js               # Express app entry point
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Expense.js          # Expense schema
│   │   ├── Budget.js           # Monthly budget schema
│   │   └── Split.js            # Bill split schema
│   └── routes/
│       ├── auth.js             # POST /signup, POST /login, GET /me
│       ├── expenses.js         # CRUD /expenses
│       ├── budgets.js          # CRUD /budgets
│       └── splits.js           # CRUD /splits
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.js              # Routes definition
│       ├── index.js            # React entry point
│       ├── components/
│       │   ├── TopBar.js       # Profile menu + dark mode toggle
│       │   ├── ProfileMenu.js  # Dropdown profile actions
│       │   └── DarkModeToggle.js
│       ├── context/
│       │   └── ThemeContext.js # Dark/light mode context
│       ├── hooks/
│       │   └── useWindowWidth.js # Responsive breakpoint hook
│       ├── pages/
│       │   ├── login.js        # Login page
│       │   ├── signup.js       # Signup page
│       │   ├── dashboard.js    # Main dashboard
│       │   ├── addExpense.js   # Standalone add expense page
│       │   └── splitBills.js   # Split bills page
│       ├── services/
│       │   └── api.js          # Axios instance + interceptors
│       └── styles/
│           ├── authStyles.js
│           ├── dashboardStyles.js
│           ├── addExpenseStyles.js
│           ├── splitBillsStyles.js
│           ├── profileMenuStyles.js
│           └── responsive.css
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables)), then:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on **http://localhost:5000** by default.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app starts on **http://localhost:3000**.

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

| Variable        | Description                                        |
| --------------- | -------------------------------------------------- |
| `MONGO_URI`     | MongoDB connection string                          |
| `JWT_SECRET`    | Secret key used to sign JWT tokens                 |
| `PORT`          | Port the Express server listens on (default: 5000) |
| `CLIENT_ORIGIN` | Comma-separated allowed frontend origins for CORS  |

---

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint  | Auth | Description                |
| ------ | --------- | ---- | -------------------------- |
| POST   | `/signup` | No   | Register a new user        |
| POST   | `/login`  | No   | Login, returns JWT         |
| GET    | `/me`     | Yes  | Get logged-in user profile |

### Expenses

| Method | Endpoint        | Auth | Description                    |
| ------ | --------------- | ---- | ------------------------------ |
| GET    | `/expenses`     | Yes  | List all expenses for the user |
| POST   | `/expenses/add` | Yes  | Add a new expense              |
| PUT    | `/expenses/:id` | Yes  | Update an expense              |
| DELETE | `/expenses/:id` | Yes  | Delete an expense              |

### Budgets

| Method | Endpoint       | Auth | Description                        |
| ------ | -------------- | ---- | ---------------------------------- |
| GET    | `/budgets`     | Yes  | List all budgets for the user      |
| POST   | `/budgets`     | Yes  | Create or update a category budget |
| DELETE | `/budgets/:id` | Yes  | Remove a budget                    |

### Split Bills

| Method | Endpoint             | Auth | Description                         |
| ------ | -------------------- | ---- | ----------------------------------- |
| GET    | `/splits`            | Yes  | List splits created by the user     |
| GET    | `/splits/incoming`   | Yes  | List splits where user is a member  |
| POST   | `/splits`            | Yes  | Create a new bill split             |
| PUT    | `/splits/:id/settle` | Yes  | Mark yourself as settled in a split |

---

## Data Models

### User

```
username      String   required, unique, 3–30 chars
password      String   required, hashed (bcrypt, salt 12)
purpose       String   enum: Personal / Retail Shop / Trip / Petrol / Other
purposeNote   String   max 200 chars
mobile        String   optional
```

### Expense

```
user          ObjectId  ref: User
category      String    max 50 chars
amount        Number    min 0
date          String    YYYY-MM-DD
toUser        String    populated for split bill entries
recurring     Boolean   default: false
```

### Budget

```
user          ObjectId  ref: User
category      String
monthlyLimit  Number
```

### Split

```
creator       ObjectId  ref: User
description   String
totalAmount   Number
members[]
  name        String
  mobile      String
  settled     Boolean   default: false
```

---

## Security

- Passwords hashed with **bcryptjs** (12 salt rounds) — never stored in plain text
- **JWT** tokens for stateless authentication
- **Helmet** sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
- **Rate limiting** on `/login` and `/signup` — 50 requests per 15 minutes
- **CORS** restricted to allowed frontend origins via `CLIENT_ORIGIN`
- **Input validation** with express-validator on all write endpoints
- No sensitive data exposed in API error responses

---

## Screenshots

> _Add screenshots here by placing images in a `/screenshots` folder and referencing them:_
>
> ```md
> ![Dashboard](screenshots/dashboard.png)
> ![Split Bills](screenshots/split-bills.png)
> ```
