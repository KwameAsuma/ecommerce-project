const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: "asc" },
    });
    res.status(200).json({ status: "success", faqs });
  } catch (error) {
    console.error("getFaqs error:", error);
    res.status(500).json({ error: "Failed to fetch FAQs." });
  }
};

const createTicket = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required." });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        messages: {
          create: {
            sender: "MERCHANT",
            message,
          },
        },
      },
      include: {
        messages: true,
      }
    });

    res.status(201).json({ status: "success", ticket });
  } catch (error) {
    console.error("createTicket error:", error);
    res.status(500).json({ error: "Failed to create ticket." });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const userId = req.userId;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    res.status(200).json({ status: "success", tickets });
  } catch (error) {
    console.error("getUserTickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
};

const replyTicket = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to ticket." });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "MERCHANT",
        message,
      }
    });

    // Update ticket updatedAt
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({ status: "success", message: newMessage });
  } catch (error) {
    console.error("replyTicket error:", error);
    res.status(500).json({ error: "Failed to reply to ticket." });
  }
};

module.exports = { getFaqs, createTicket, getUserTickets, replyTicket };
