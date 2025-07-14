// app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('../middlewares/errorMiddleware');
const ApiError = require('../utils/apiError');

const app = express();

// Core middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// !SETUP import your routes here
const exampleRoutes = require('../routes/exampleRoutes');

// !SETUP routes declaration
app.use('/api/example', exampleRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Server is up and running',
  });
});

// Not Found Handler
app.use((_req, _res, next) => {
  next(ApiError.notFound('Resource Not Found'));
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
