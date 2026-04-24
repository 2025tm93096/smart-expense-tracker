# Architecture — Smart Expense Tracker

## Overview

Smart Expense Tracker follows a classic **3-tier web application architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│              React SPA (hosted on Vercel)                   │
│   Login │ Signup │ Dashboard │ Add Expense │ Split Bills    │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTPS / REST API (JSON)
                        │  Authorization: Bearer <JWT>
┌───────────────────────▼─────────────────────────────────────┐
│                      SERVER                                  │
│           Node.js + Express (hosted on Render)               │
│                                                             │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │ Auth Routes│  │Expense Routes│  │ Budget / Split     │   │
│  │ /signup    │  │ /expenses    │  │ Routes             │   │
│  │ /login     │  │ GET POST     │  │ /budgets /splits   │   │
│  │ /me        │  │ PUT DELETE   │  │                    │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  helmet (headers) │ cors │ rate-limit │ auth (JWT)   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │  Mongoose ODM
┌───────────────────────▼─────────────────────────────────────┐
│                     DATABASE                                 │
│              MongoDB Atlas (free M0 tier)                    │
│                                                             │
│   users │ expenses │ budgets │ splits                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
GitHub (main branch)
        │
        ├─── auto-deploy ──► Vercel (Frontend)
        │                    - Serves React SPA
        │                    - CDN edge network
        │                    - Env: REACT_APP_API_URL
        │
        └─── auto-deploy ──► Render (Backend)
                             - Node.js web service
                             - Env: MONGO_URI, JWT_SECRET,
                               CLIENT_ORIGIN, PORT
                                    │
                                    └──► MongoDB Atlas
                                         - Shared cluster (M0)
                                         - DB: expense-tracker
```

---

## Request Flow

### Authenticated Request (e.g. fetch expenses)

```
Browser
  │
  │ 1. GET /expenses
  │    Header: Authorization: Bearer <token>
  ▼
Express Server
  │
  │ 2. helmet() — sets security headers
  │ 3. cors()   — validates Origin header vs CLIENT_ORIGIN
  │ 4. authMiddleware — verifies JWT, extracts userId
  │ 5. Route handler — queries MongoDB via Mongoose
  │ 6. Returns JSON response
  ▼
Browser receives response → React updates state → UI re-renders
```

### Login Flow

```
Browser submits username + password
  ▼
POST /login (rate limited: 50 req / 15 min)
  ▼
express-validator validates input
  ▼
User.findOne({ username })
  ▼
bcrypt.compare(password, user.password)
  ▼
jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  ▼
Returns { token, username, purpose, mobile }
  ▼
Frontend stores token in localStorage
  ▼
All subsequent requests attach: Authorization: Bearer <token>
```

---

## Technology Choices & Rationale

| Decision           | Choice                     | Reason                                                     |
| ------------------ | -------------------------- | ---------------------------------------------------------- |
| Frontend framework | React 19                   | Component-based, large ecosystem, SPA routing              |
| State management   | useState + Context API     | Sufficient for this scale — no Redux needed                |
| Routing            | React Router v7            | Standard for React SPAs                                    |
| Charts             | Chart.js + react-chartjs-2 | Lightweight, interactive pie chart with click events       |
| HTTP client        | Axios                      | Interceptors for token injection and 401 handling          |
| Backend framework  | Express                    | Minimal, flexible, large ecosystem                         |
| ODM                | Mongoose                   | Schema validation, virtuals, middleware hooks              |
| Auth               | JWT (stateless)            | No session storage needed, scales horizontally             |
| Password hashing   | bcryptjs (12 rounds)       | Industry standard, timing-attack safe                      |
| Input validation   | express-validator          | Declarative validation per route                           |
| Security headers   | helmet                     | XSS, clickjacking, MIME sniffing protection out of the box |
| Rate limiting      | express-rate-limit         | Prevents brute-force on login/signup                       |
| Database           | MongoDB Atlas              | Flexible schema, free tier, easy cloud hosting             |
| Frontend hosting   | Vercel                     | Free, auto-deploy from GitHub, CDN                         |
| Backend hosting    | Render                     | Free tier, supports Node.js, auto-deploy from GitHub       |

---

## Security Architecture

```
┌────────────────────────────────────────────┐
│              Security Layers               │
│                                            │
│  Layer 1: Transport                        │
│    └─ HTTPS enforced (Vercel + Render)     │
│                                            │
│  Layer 2: HTTP Headers (helmet)            │
│    └─ XSS-Protection                       │
│    └─ X-Frame-Options (clickjacking)       │
│    └─ X-Content-Type-Options               │
│    └─ Content-Security-Policy              │
│                                            │
│  Layer 3: CORS                             │
│    └─ Only CLIENT_ORIGIN allowed           │
│                                            │
│  Layer 4: Rate Limiting                    │
│    └─ /login, /signup: 50 req / 15 min     │
│                                            │
│  Layer 5: Input Validation                 │
│    └─ express-validator on all routes      │
│                                            │
│  Layer 6: Authentication                   │
│    └─ JWT verified on every protected req  │
│                                            │
│  Layer 7: Authorization                    │
│    └─ user ID from token vs resource owner │
└────────────────────────────────────────────┘
```
