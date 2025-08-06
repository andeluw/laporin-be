// chowjustin/laporin-be/src/routes/reportRoutes.js

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const { apiResponse } = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

// Create a new report
router.post("/", async (req, res, next) => {
  const { details, userPublicKey } = req.body;
  if (!userPublicKey) {
    return next(ApiError.badRequest("userPublicKey is required."));
  }
  try {
    const report = await prisma.report.create({
      data: {
        details,
        userPublicKey,
      },
    });
    res
      .status(201)
      .json(
        apiResponse({ data: report, message: "Report created successfully." })
      );
  } catch (error) {
    next(error);
  }
});

// Get a list of all reports (for officer dashboard)
router.get("/", async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(apiResponse({ data: reports }));
  } catch (error) {
    next(error);
  }
});

// Get a single report's details, including public keys
router.get("/:reportId", async (req, res, next) => {
  const { reportId } = req.params;
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      return next(ApiError.notFound("Report not found."));
    }
    res.status(200).json(apiResponse({ data: report }));
  } catch (error) {
    next(error);
  }
});

// Assign an officer by saving their public key
router.put("/:reportId/assign", async (req, res, next) => {
  const { reportId } = req.params;
  const { officerPublicKey } = req.body;
  if (!officerPublicKey) {
    return next(ApiError.badRequest("officerPublicKey is required."));
  }

  try {
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { officerPublicKey },
    });
    res
      .status(200)
      .json(apiResponse({ data: updatedReport, message: "Officer assigned." }));
  } catch (error) {
    next(error);
  }
});

// find a report by userPublicKey
router.post("/lookup", async (req, res, next) => {
  const { userPublicKey } = req.body;
  if (!userPublicKey) {
    return next(ApiError.badRequest("userPublicKey is required."));
  }

  try {
    const report = await prisma.report.findFirst({
      where: { userPublicKey },
    });

    if (!report) {
      return next(ApiError.notFound("Report not found for the given key."));
    }

    res.status(200).json(apiResponse({ data: { reportId: report.id } }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
