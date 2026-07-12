const express = require("express");
const { getFaqs, createTicket, getUserTickets, replyTicket } = require("../controllers/supportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/faqs", getFaqs);
router.post("/tickets", protect, createTicket);
router.get("/tickets", protect, getUserTickets);
router.post("/tickets/:id/reply", protect, replyTicket);

module.exports = router;
