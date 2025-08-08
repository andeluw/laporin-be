const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("../middlewares/errorMiddleware");
const ApiError = require("../utils/apiError");
const authRoutes = require("../routes/authRoutes.js");
const chatRoutes = require("../routes/chatRoutes.js");
const reportRoutes = require("../routes/reportRoutes.js");

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Server is up and running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);

app.use((_req, _res, next) => {
  next(ApiError.notFound("Resource Not Found"));
});

app.use(errorMiddleware);

module.exports = app;
