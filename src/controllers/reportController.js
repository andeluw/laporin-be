const prisma = require("../utils/prisma");
const { apiResponse } = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const { analyzeReport } = require("../services/aiAnalysisService");

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

    analyzeReport(report.id).catch((err) => {
      console.error(`Background analysis failed for report ${report.id}:`, err);
    });
  } catch (error) {
    next(error);
  }
};

// Get a list of all reports (for officer dashboard)
const getAllReports = async (req, res, next) => {
  const { instance } = req.user;
  try {
    const reports = await prisma.report.findMany({
      where: { recommended_instance: instance },
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
  const { key } = req.body;
  if (!key) {
    return next(ApiError.badRequest("key is required."));
  }

  try {
    const report = await prisma.report.findFirst({
      where: { user_public_key: key },
    });

    if (!report) {
      return next(ApiError.notFound("Laporan tidak ditemukan."));
    }

    res
      .status(200)
      .json(apiResponse({ data: { id: report.id, details: report.details } }));
  } catch (error) {
    next(error);
  }
};

const triggerAnalysisById = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(ApiError.badRequest("ID Laporan tidak ditemukan."));
  }

  try {
    console.log(`Triggering analysis for report ID: ${id}`);
    const analysisResult = await analyzeReport(id);
    if (!analysisResult) {
      return next(ApiError.internal("Gagal menganalisis laporan."));
    }

    res.status(200).json(
      apiResponse({
        data: analysisResult,
        message: "Analisis laporan berhasil.",
      })
    );
  } catch (error) {
    next(error);
  }
};

const getOfficerKeys = async (req, res, next) => {
  return res.status(200).json(
    apiResponse({
      data: {
        public_key: process.env.OFFICER_PUBLIC_KEY,
        private_key: process.env.OFFICER_PRIVATE_KEY,
      },
      message: "Kunci publik petugas dan instance berhasil diambil.",
    })
  );
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  assignOfficer,
  getReportByPublicKey,
  triggerAnalysisById,
  getOfficerKeys,
};
