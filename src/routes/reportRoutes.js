const express = require("express");
const router = express.Router();

const { authenticate, onlyAllow } = require("../middlewares/authMiddleware");

const {
  createReport,
  getAllReports,
  getReportById,
  assignOfficer,
  getReportByPublicKey,
  triggerAnalysisById,
  getOfficerKeys,
} = require("../controllers/reportController");

router.post("/", createReport);
router.get("/", authenticate, onlyAllow("OFFICER"), getAllReports);
router.get("/officer-keys", authenticate, onlyAllow("OFFICER"), getOfficerKeys);
router.post("/lookup", getReportByPublicKey);
router.get("/:reportId", getReportById);
router.put(
  "/:reportId/assign",
  authenticate,
  onlyAllow("OFFICER"),
  assignOfficer
);
router.post("/:id/analyze", triggerAnalysisById);

module.exports = router;
