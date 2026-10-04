import Session from "../models/Session.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import { findOrCreateConnection } from "./connectionController.js";
import { emitToUser } from "../sockets/socketManager.js";

const ACHIEVEMENT_MILESTONES = [
  { count: 1, label: "First session completed" },
  { count: 5, label: "5 sessions completed" },
  { count: 10, label: "10 sessions completed" },
  { count: 25, label: "25 sessions completed" },
];

const populateSession = (query) =>
  query
    .populate("requester", "-password")
    .populate("recipient", "-password")
    .populate("connection");

// ================= SCHEDULE SESSION =================

export const scheduleSession = async (req, res) => {
  try {
    const { recipient, topic, scheduledAt, duration, notes } = req.body;

    if (!recipient || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "recipient and scheduledAt are required",
      });
    }

    if (recipient === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You can't schedule a session with yourself",
      });
    }

    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    const connection = await findOrCreateConnection(req.user.id, recipient);

    const session = await Session.create({
      connection: connection._id,
      requester: req.user.id,
      recipient,
      topic: topic || "",
      scheduledAt,
      duration: duration || 60,
      notes: notes || "",
      status: "pending",
    });

    const populated = await populateSession(Session.findById(session._id));

    emitToUser(recipient, "session:new", populated);
    emitToUser(req.user.id, "session:new", populated);

    res.status(201).json({ success: true, message: "Session request sent", session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ACCEPT / REJECT =================

export const respondSession = async (req, res) => {
  try {
    const { status } = req.body; // "accepted" | "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the recipient can respond" });
    }

    if (session.status !== "pending") {
      return res.status(400).json({ success: false, message: "Session already responded to" });
    }

    session.status = status;
    await session.save();

    const populated = await populateSession(Session.findById(session._id));

    emitToUser(session.requester, "session:updated", populated);
    emitToUser(session.recipient, "session:updated", populated);

    res.json({ success: true, message: `Session ${status}`, session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CANCEL =================

export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const isParty =
      session.requester.toString() === req.user.id ||
      session.recipient.toString() === req.user.id;

    if (!isParty) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!["pending", "accepted"].includes(session.status)) {
      return res.status(400).json({ success: false, message: "Session can't be cancelled" });
    }

    session.status = "cancelled";
    await session.save();

    const populated = await populateSession(Session.findById(session._id));

    emitToUser(session.requester, "session:updated", populated);
    emitToUser(session.recipient, "session:updated", populated);

    res.json({ success: true, message: "Session cancelled", session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= COMPLETE =================
// Either party can mark an accepted session as complete. This is what
// drives the Learning Progress numbers on a connection.

export const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const isParty =
      session.requester.toString() === req.user.id ||
      session.recipient.toString() === req.user.id;

    if (!isParty) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (session.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted sessions can be marked complete",
      });
    }

    session.status = "completed";
    await session.save();

    const connection = await Connection.findById(session.connection);
    if (connection) {
      connection.completedSessions += 1;
      connection.progress = Math.min(100, connection.progress + 10);
      connection.progressTimeline.push({
        date: new Date(),
        progress: connection.progress,
        note: session.topic ? `Completed: ${session.topic}` : "Session completed",
      });

      const milestone = ACHIEVEMENT_MILESTONES.find(
        (m) => m.count === connection.completedSessions
      );
      if (milestone && !connection.achievements.includes(milestone.label)) {
        connection.achievements.push(milestone.label);
      }

      await connection.save();
      emitToUser(session.requester, "connection:updated", connection);
      emitToUser(session.recipient, "connection:updated", connection);
    }

    const populated = await populateSession(Session.findById(session._id));

    emitToUser(session.requester, "session:updated", populated);
    emitToUser(session.recipient, "session:updated", populated);

    res.json({ success: true, message: "Session marked complete", session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPCOMING =================

export const getUpcomingSessions = async (req, res) => {
  try {
    const filter = {
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: { $in: ["pending", "accepted"] },
    };
    if (req.query.connection) filter.connection = req.query.connection;

    const sessions = await populateSession(Session.find(filter).sort({ scheduledAt: 1 }));

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PENDING REQUESTS (incoming, awaiting my response) =====

export const getPendingRequests = async (req, res) => {
  try {
    const filter = { recipient: req.user.id, status: "pending" };
    if (req.query.connection) filter.connection = req.query.connection;

    const sessions = await populateSession(Session.find(filter).sort({ scheduledAt: 1 }));

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= HISTORY =================

export const getSessionHistory = async (req, res) => {
  try {
    const filter = {
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: { $in: ["completed", "rejected", "cancelled"] },
    };
    if (req.query.connection) filter.connection = req.query.connection;

    const sessions = await populateSession(Session.find(filter).sort({ updatedAt: -1 }));

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
