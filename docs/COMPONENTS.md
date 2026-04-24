# Frontend Component Hierarchy — Smart Expense Tracker

## Route Map

```
/                  → Login
/signup            → Signup
/dashboard         → Dashboard
/add-expense       → AddExpense (standalone page, also available as modal from dashboard)
/split-bills       → SplitBills
```

---

## Full Component Tree

```
App
├── ThemeProvider (context/ThemeContext)
│   └── Router (BrowserRouter)
│       ├── Route: / → Login
│       │     └── [no sub-components]
│       │
│       ├── Route: /signup → Signup
│       │     └── [no sub-components]
│       │
│       ├── Route: /dashboard → Dashboard
│       │     ├── TopBar
│       │     │   ├── ProfileMenu
│       │     │   │   └── [dropdown: username, purpose, logout]
│       │     │   └── DarkModeToggle (inline toggle switch)
│       │     │
│       │     ├── Header row
│       │     │   ├── Link → /split-bills (Split Bills button)
│       │     │   └── Button → opens Add Expense modal
│       │     │
│       │     ├── [Modal] Add Expense Popup
│       │     │   └── form: category, amount, date, recurring
│       │     │
│       │     ├── [Modal] Edit Expense Popup
│       │     │   └── form: category, amount, date, recurring
│       │     │
│       │     ├── [Modal] Category Drill-down Popup
│       │     │   ├── Budget warning banner (if budget set)
│       │     │   │   └── [inline] Edit Monthly Limit form
│       │     │   └── Table: date, amount, recurring per expense
│       │     │
│       │     ├── Incoming Split Requests banner (if any)
│       │     │
│       │     ├── Summary Cards row
│       │     │   ├── Total Expenses count
│       │     │   ├── Total Amount
│       │     │   ├── Categories count
│       │     │   └── Latest Entry date
│       │     │
│       │     ├── Filter Bar
│       │     │   ├── Month select
│       │     │   ├── Search input
│       │     │   ├── Category select
│       │     │   └── Export CSV button
│       │     │
│       │     └── Main Grid (2 columns on desktop, 1 on mobile)
│       │         ├── Left card: All Expenses Table
│       │         │   ├── Table: Category | Amount | Date | To | Actions
│       │         │   ├── Edit (✏️) button per row → Edit modal
│       │         │   ├── Delete (🗑) button per row
│       │         │   └── Pagination controls
│       │         │
│       │         └── Right card: Spending by Category
│       │             ├── Pie chart (Chart.js) — clickable slices
│       │             ├── Category legend — clickable items
│       │             └── Budget section
│       │                 ├── Progress bars per category
│       │                 ├── Over/warning labels
│       │                 └── Set Monthly Budget form (toggle)
│       │
│       ├── Route: /add-expense → AddExpense (standalone page)
│       │     ├── TopBar
│       │     │   ├── ProfileMenu
│       │     │   └── DarkModeToggle
│       │     └── Form: category, amount, date, recurring
│       │
│       └── Route: /split-bills → SplitBills
│             ├── TopBar
│             │   ├── ProfileMenu
│             │   └── DarkModeToggle
│             ├── Link ← Back to Dashboard
│             │
│             └── Main Grid (2 columns on desktop, 1 on mobile)
│                 ├── Left card: Create Split Form
│                 │   ├── Description input
│                 │   ├── Note input
│                 │   ├── Total Amount input
│                 │   ├── "Add Myself" checkbox
│                 │   ├── Member rows (up to 20)
│                 │   │   └── name | country code | mobile | remove btn
│                 │   ├── + Add Member button
│                 │   └── Submit button
│                 │
│                 └── Right card (2 sections)
│                     ├── Requests for You
│                     │   └── Incoming split cards
│                     │       └── Pay Now / ✓ Paid button
│                     └── Your Created Splits
│                         └── Split cards
│                             └── Member rows with settled toggle
```

---

## Shared Components

### `TopBar`

- Rendered on: Dashboard, AddExpense, SplitBills
- Contains: ProfileMenu + dark mode toggle switch
- Reads: `isDark`, `toggleTheme` from `ThemeContext`

### `ProfileMenu`

- Dropdown showing: username, purpose badge
- Actions: Logout (clears localStorage token, redirects to `/`)

### `DarkModeToggle` (inline in TopBar)

- Animated pill switch
- Calls `toggleTheme()` from `ThemeContext`

---

## Context

### `ThemeContext`

```
Provider wraps entire app
  ├── isDark: boolean
  └── toggleTheme: () => void

Consumed by:
  - TopBar (toggle control)
  - Dashboard (styles)
  - AddExpense (styles)
  - SplitBills (styles)
  - ProfileMenu (styles)
  - All style functions: getDashboardStyles(isDark, isMobile)
```

---

## Custom Hooks

### `useWindowWidth()`

- Returns current `window.innerWidth`
- Updates on `resize` event
- Used to determine `isMobile = width < 768`
- Consumed by: Dashboard, AddExpense, SplitBills

---

## Services

### `api.js` (Axios instance)

```
baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000"

Request interceptor:
  └── Attaches Authorization: Bearer <token> from localStorage

Response interceptor:
  └── On 401 with token present → clears localStorage → redirects to /
```

---

## Styling Approach

All styles are JS objects (no CSS-in-JS library). Style functions receive `(isDark, isMobile)` and return style maps:

```
getAddExpenseStyles(isDark, isMobile) → { page, card, input, ... }
getDashboardStyles(isDark, isMobile)  → { header, table, modal, ... }
getSplitBillsStyles(isDark, isMobile) → { card, memberRow, ... }
authStyles(isDark)                    → { container, input, btn, ... }
profileMenuStyles(isDark)             → { dropdown, item, ... }
```

Global responsive overrides live in `styles/responsive.css`.
