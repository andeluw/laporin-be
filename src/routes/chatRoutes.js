const express = require("express");
const { getMessages, storeMessage } = require("../controllers/chatController");
const router = express.Router();

router.post("/:reportId/messages", storeMessage);
router.get("/:reportId/messages", getMessages);

module.exports = router;
