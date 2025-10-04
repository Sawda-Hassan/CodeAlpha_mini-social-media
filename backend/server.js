require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts"); // optional
const commentRoutes = require("./routes/comments");
const followRoutes = require("./routes/follow");

const app = express();

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://127.0.0.1:5500", // frontend URL
    credentials: true,
  })
);

// Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Static frontend
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes); // optional
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);

// /api/me helper
app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ msg: "No token" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    return res.json({ user: payload });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});

// SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 for API
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ message: "Not found" });
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("Missing MONGODB_URI in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGINT", () => mongoose.connection.close(() => process.exit(0)));
process.on("SIGTERM", () => mongoose.connection.close(() => process.exit(0)));
