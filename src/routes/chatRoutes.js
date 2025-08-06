// src/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../generated/prisma");
const { apiResponse } = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

// Store a new encrypted message
router.post("/:reportId/messages", async (req, res, next) => {
  const { reportId } = req.params;
  const { sender, content } = req.body;

  if (!sender || !content) {
    return next(ApiError.badRequest("Sender and content are required."));
  }

  try {
    // FIX: Upsert the report. Create it if it doesn't exist.
    // This makes sure the foreign key constraint will not be violated.
    await prisma.report.upsert({
      where: { id: reportId },
      update: {}, // No update needed if it exists
      create: { id: reportId }, // Create it with the given ID if it doesn't
    });

    // Now, create the message, which is guaranteed to have a valid reportId
    const message = await prisma.message.create({
      data: {
        reportId,
        sender,
        content,
      },
    });
    res
      .status(201)
      .json(apiResponse({ data: message, message: "Message saved" }));
  } catch (error) {
    console.error("Failed to save message:", error);
    next(ApiError.internal("Could not save the message."));
  }
});

// Get all encrypted messages for a report
router.get("/:reportId/messages", async (req, res, next) => {
  const { reportId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { reportId },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(apiResponse({ data: messages }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
