# Assumptions, Decisions & UI Wireframes

---

## Assumptions

### Business / Domain

1. **Single currency (₹ INR)** — The app is designed for Indian users. All amounts are displayed in Indian Rupees using `toLocaleString("en-IN")`. No multi-currency support.

2. **One user = one account** — There is no concept of organisations, teams, or shared accounts. All data is strictly scoped to the logged-in user.

3. **Split bills are informal** — The app tracks splits socially (by mobile number matching), not via payment gateways. "Settled" is self-reported; no actual money transfer happens in-app.

4. **Monthly budgets** — Budgets are set per category and reset-tracked monthly. The app compares spending for the current calendar month only (`YYYY-MM` prefix matching).

5. **Date is user-entered** — Expense dates are stored as `YYYY-MM-DD` strings, not timestamps. This allows backdating and is simpler for filtering.

6. **Recurring expenses** — The `recurring` flag is informational only (shown as a badge). There is no automated recurring creation — users add them manually each month.

7. **Mobile number = identity for splits** — Mobile number is **required at signup**. Split member matching is based on the mobile number stored in the user's profile.

8. **Max 20 split members** — Practical upper limit per split group.

9. **Max 10 expenses per page** — Pagination is set at 10 to keep table readable on all screen sizes.

---

### Technical

1. **JWT stored in localStorage** — Chosen over cookies for simplicity in a SPA. The app clears the token on 401 responses automatically.

2. **No email / password reset** — User registration only requires a username and password. Email-based recovery is out of scope.

3. **No offline mode** — The app requires a network connection. No service worker or local caching is implemented.

4. **No real-time updates** — Data is fetched on page load and after user actions. No WebSocket or polling is used.

5. **Single MongoDB instance** — All collections are in one database (`expense-tracker`) on a shared MongoDB Atlas M0 cluster. No sharding or replica sets at this scale.

6. **Vercel handles only the React build** — The backend is completely separate on Render. There is no SSR or API routes in Vercel.

---

## Design Decisions

| Decision                              | Choice                           | Alternative considered                                     |
| ------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| Add Expense as modal on dashboard     | Inline popup modal               | Separate `/add-expense` page (kept as fallback route)      |
| Pie chart click → category drill-down | Inline popup                     | Filter table by category                                   |
| Budget warning                        | Inline in spending chart + popup | Separate alerts page                                       |
| Split member matching                 | By mobile number                 | By username lookup (requires all members to have accounts) |
| Dark mode                             | CSS-in-JS via `isDark` flag      | CSS variables / Tailwind                                   |
| Responsive layout                     | Custom JS breakpoint hook        | CSS media queries only                                     |
| Category sorting                      | By highest spend % first         | Alphabetical                                               |

---

## UI/UX Wireframes

> Text-based wireframes showing layout intent for each page.

---

### Login / Signup Page

```
┌────────────────────────────────────┐
│                                    │
│         🌙 / ☀️  (top right)       │
│                                    │
│    ┌──────────────────────────┐    │
│    │     💰 Smart Expense     │    │
│    │         Tracker          │    │
│    │                          │    │
│    │  Username: [__________]  │    │
│    │  Password: [__________]  │    │
│    │                          │    │
│    │     [  Login  ]          │    │
│    │                          │    │
│    │  Don't have an account?  │    │
│    │     Sign up here         │    │
│    └──────────────────────────┘    │
│                                    │
└────────────────────────────────────┘
```

---

### Dashboard — Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  💰 Smart Expense Tracker   [Split Bills] [+Add Expense] 👤 🌙  │
├─────────────────────────────────────────────────────────────────┤
│  🔔 Split Requests (if any)                                     │
├───────────┬───────────┬───────────┬───────────────────────────┤
│ Expenses  │  Amount   │ Categories│  Latest Entry              │
│    12     │ ₹24,500   │     5     │  2026-04-20               │
├───────────┴───────────┴───────────┴───────────────────────────┤
│ [Month ▼]  [🔍 Search]  [Category ▼]  [⬇ Export CSV]          │
├────────────────────────────┬────────────────────────────────────┤
│  All Expenses              │  Spending by Category              │
│  ─────────────────────     │  ────────────────────────          │
│  Category  Amt  Date  To   │         [Pie Chart]                │
│  ──────── ──── ──── ────   │  (click slice → popup)             │
│  Food     250  4/20  —  ✏🗑│                                    │
│  Travel  1200  4/18  —  ✏🗑│  ● Food      ₹2,500  (32%)        │
│  Education 800 4/15  —  ✏🗑│  ● Travel    ₹1,800  (23%)        │
│                            │  ● Education ₹1,200  (15%)        │
│  ‹ Prev  1  2  3  Next ›   │                                    │
│                            │  [+ Set Monthly Budget]            │
└────────────────────────────┴────────────────────────────────────┘
```

---

### Dashboard — Mobile

```
┌──────────────────────────────┐
│ 💰 Smart Expense   👤 🌙     │
│ [ Split Bills ] [+Add Exp]   │
├──────────────────────────────┤
│ Expenses│ Amt │ Cat │ Latest │
│   12    │₹24k │  5  │4/20   │
├──────────────────────────────┤
│ [Month] [Search] [Cat] [CSV] │
├──────────────────────────────┤
│ All Expenses                 │
│ ─────────────────────        │
│ Food   ₹250  2026-04-20  ✏🗑 │
│ Travel ₹1200 2026-04-18  ✏🗑 │
│  ‹ 1  2  3 ›                 │
├──────────────────────────────┤
│ Spending by Category         │
│      [Pie Chart]             │
│ ● Food     ₹2,500  (32%)    │
│ ● Travel   ₹1,800  (23%)    │
│ [+ Set Monthly Budget]       │
└──────────────────────────────┘
```

---

### Add Expense Modal (popup)

```
┌─────────────────────────────────┐
│  Add Expense               [×]  │
├─────────────────────────────────┤
│  Category  [Food          ▼]    │
│  Amount    [____________]       │
│  Date      [____________]       │
│  ☐ Recurring monthly expense    │
│                                 │
│  [ Add Expense ]  [ Cancel ]    │
└─────────────────────────────────┘
```

---

### Category Drill-down Popup

```
┌─────────────────────────────────┐
│  ● Education               [×]  │
│  3 expenses · ₹3,200 total      │
├─────────────────────────────────┤
│  ⚠ Approaching Budget Limit     │
│  ████████░░░░   80%             │
│  ₹3,200 of ₹4,000  [Edit limit] │
├─────────────────────────────────┤
│  Date       Amount   Recurring  │
│  2026-04-15  ₹1,200     —       │
│  2026-04-10  ₹1,000     🔄      │
│  2026-04-05  ₹1,000     —       │
└─────────────────────────────────┘
```

---

### Split Bills Page

```
┌──────────────────────────────────────────────────────────┐
│  ← Dashboard                              👤 🌙          │
│  Split Bills                                             │
├────────────────────────┬─────────────────────────────────┤
│  Create a Split        │  Requests for You               │
│  ─────────────         │  ──────────────────             │
│  Description [______]  │  Goa Trip — Alice               │
│  Note        [______]  │  Your share: ₹4,000             │
│  Total Amt   [______]  │  [ Pay Now ]                    │
│                        ├─────────────────────────────────┤
│  ☐ Add myself          │  Your Created Splits            │
│                        │  ──────────────────             │
│  Member 1              │  Goa Trip  ₹12,000              │
│  Name [___] +91 [____] │  Alice  ₹4,000  ✓ Settled       │
│  Member 2              │  Bob    ₹4,000  Pending          │
│  Name [___] +91 [____] │  Me     ₹4,000  ✓ Settled       │
│  [+ Add Member]        │                                 │
│                        │                                 │
│  [ Create Split ]      │                                 │
└────────────────────────┴─────────────────────────────────┘
```

---

## Known Limitations / Out of Scope

1. No email notifications for split reminders
2. No real payment gateway integration
3. No data export to PDF (only CSV)
4. No multi-currency support
5. No recurring expense auto-creation
6. No admin panel or user management
7. No expense categories management UI (categories are hardcoded presets + free-text)
8. Render free tier causes ~30s cold start after inactivity
