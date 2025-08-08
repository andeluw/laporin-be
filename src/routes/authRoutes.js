const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserFromToken,
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getUserFromToken);

module.exports = router;
