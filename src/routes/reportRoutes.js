const express = require("express");
const router = express.Router();

const { authenticate, onlyAllow } = require("../middlewares/authMiddleware");

const {
  createReport,
  getAllReports,
  getReportById,
  assignOfficer,
  getReportByPublicKey,
} = require("../controllers/reportController");

router.post("/", createReport);
router.get("/", authenticate, onlyAllow("OFFICER"), getAllReports);
router.get("/:reportId", authenticate, onlyAllow("OFFICER"), getReportById);
router.put(
  "/:reportId/assign",
  authenticate,
  onlyAllow("OFFICER"),
  assignOfficer
);
router.post(
  "/lookup",
  authenticate,
  onlyAllow("OFFICER"),
  getReportByPublicKey
);

module.exports = router;
