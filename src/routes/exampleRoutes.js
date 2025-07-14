// !SETUP This is a demonstration route. You should remove or replace this file later.

const express = require('express');
const router = express.Router();
const { apiResponse, paginatedResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// Dummy data to simulate a database
const users = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
}));

// Example 1: Return a simple success response
router.get('/single', (_req, res) => {
  return res.status(200).json(
    apiResponse({
      message: 'Single user retrieved',
      data: { id: 1, name: 'John Doe' },
    })
  );
});

// Example 2: Return paginated results
router.get('/paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  const start = (page - 1) * perPage;
  const data_per_page = users.slice(start, start + perPage);
  const max_page = Math.ceil(users.length / perPage);

  return res.status(200).json(
    paginatedResponse({
      data_per_page,
      page,
      max_page,
      message: 'Paginated users fetched successfully',
    })
  );
});

// Example 3: Simulate a bad request error
router.get('/error', (_req, _res, next) => {
  return next(ApiError.badRequest('This is a simulated bad request'));
});

module.exports = router;
