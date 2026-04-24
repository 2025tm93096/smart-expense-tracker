require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");
const splitRoutes = require("./routes/splits");
const budgetRoutes = require("./routes/budgets");
const rateLimit = require("express-rate-limit");

const app = express();

// Security headers
app.use(helmet());

// CORS – only allow your frontend origin
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// Rate limiting — only on login and signup to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/signup", authLimiter);
app.use("/login", authLimiter);
app.use("/", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/splits", splitRoutes);
app.use("/budgets", budgetRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
});

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
