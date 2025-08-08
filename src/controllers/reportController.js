const prisma = require("../utils/prisma");
const { apiResponse } = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

// Create a new report
const createReport = async (req, res, next) => {
  const { details, user_public_key } = req.body;
  if (!user_public_key) {
    return next(ApiError.badRequest("user_public_key is required."));
  }
  try {
    const report = await prisma.report.create({
      data: {
        details,
        user_public_key,
      },
    });
    res.status(201).json(
      apiResponse({
        data: {
          id: report.id,
        },
        message: "Report created successfully.",
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get a list of all reports (for officer dashboard)
const getAllReports = async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(apiResponse({ data: reports }));
  } catch (error) {
    next(error);
  }
};

// Get a single report's details, including public keys
const getReportById = async (req, res, next) => {
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
};

// Assign an officer by saving their public key
const assignOfficer = async (req, res, next) => {
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
};

// find a report by userPublicKey
const getReportByPublicKey = async (req, res, next) => {
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
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  assignOfficer,
  getReportByPublicKey,
};
