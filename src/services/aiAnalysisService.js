const { decryptMessage } = require("./cryptoService");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../utils/prisma");
const fs = require("fs");
const path = require("path");
const retry = require("async-retry");
const { error } = require("console");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const casePrivateKey = process.env.OFFICER_PRIVATE_KEY;
const systemPrompt = fs.readFileSync(
  path.join(__dirname, "../prompts/analyzeReportPrompt.txt"),
  "utf-8"
);

const analyzeReport = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });
  if (!report) {
    console.log(`Analysis failed: Report with ID ${reportId} not found.`);
    return;
  }

  try {
    const decryptedDetails = await decryptMessage(
      report.details,
      report.user_public_key,
      casePrivateKey
    );
    console.log(`Decrypted details for report ${reportId}:`, decryptedDetails);

    const fullPrompt = `${systemPrompt}\n\nLaporan Pengguna:\n${decryptedDetails}`;
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const analysisResult = await retry(
      async (bail) => {
        const result = await model.generateContent(fullPrompt);
        console.log(
          `Analysis result for report ${reportId}:`,
          result.response.text()
        );
        const responseText = result.response.text();
        const cleanedJsonString = responseText
          .replace(/```json|```/g, "")
          .trim();
        return JSON.parse(cleanedJsonString);
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        onRetry: (error) => {
          console.error(`Retrying analysis for report ${reportId}:`, error);
        },
      }
    );

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        summary: analysisResult.ringkasan,
        category: analysisResult.kategori,
        urgency: analysisResult.urgensi,
        recommended_instance: analysisResult.rekomendasi_instansi,
      },
    });
    return updatedReport;
  } catch (error) {
    console.error(`Error analyzing report ${reportId}:`, error);
    return;
  }
};

module.exports = { analyzeReport };
