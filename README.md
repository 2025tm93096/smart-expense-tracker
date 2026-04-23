# smart-expense-tracker

This is a expense tracker app , that tracks the overall expense :-)

Project Structure:

smart-expense-tracker/
│
├── frontend/ # React app
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Login, Dashboard, AddExpense
│ │ └── services/ # Axios API calls
│
├── backend/
│ ├── auth-service/ # User signup/login
│ ├── expense-service/ # Expense CRUD
│ ├── analytics-service/ # Reports & charts
│ └── api-gateway/ # Optional routing layer
│
└── README.md # Project documentation
