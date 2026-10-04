import Connection from "../models/Connection.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

// Finds an existing connection between two users, or creates one.
// Exported so sessionController can reuse it when a session is scheduled.
export const findOrCreateConnection = async (userA, userB) => {
  let connection = await Connection.findOne({
    users: { $all: [userA, userB] },
  });

  if (!connection) {
    connection = await Connection.create({
      users: [userA, userB],
    });
  }

  return connection;
};

// Sessions completed within the last N days, based on the progress timeline.
const countSince = (timeline, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return timeline.filter((t) => new Date(t.date).getTime() >= cutoff).length;
};

const shapeConnection = (conn, currentUserId) => {
  const other = conn.users.find(
    (u) => u._id.toString() !== currentUserId.toString()
  );

  return {
    _id: conn._id,
    otherUser: other || null,
    learningGoal: conn.learningGoal,
    progress: conn.progress,
    completedSessions: conn.completedSessions,
    achievements: conn.achievements,
    weeklyGoal: conn.weeklyGoal,
    monthlyGoal: conn.monthlyGoal,
    sessionsThisWeek: countSince(conn.progressTimeline, 7),
    sessionsThisMonth: countSince(conn.progressTimeline, 30),
    progressTimeline: conn.progressTimeline
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    createdAt: conn.createdAt,
    updatedAt: conn.updatedAt,
  };
};

// ================= GET MY CONNECTIONS =================

export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ users: req.user.id })
      .populate("users", "-password")
      .sort({ updatedAt: -1 });

    const shaped = await Promise.all(
      connections.map(async (c) => {
        const pendingForMe = await Session.countDocuments({
          connection: c._id,
          recipient: req.user.id,
          status: "pending",
        });
        return { ...shapeConnection(c, req.user.id), pendingForMe };
      })
    );

    res.json({ success: true, connections: shaped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE CONNECTION =================

export const getConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id).populate(
      "users",
      "-password"
    );

    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }

    const isMember = connection.users.some(
      (u) => u._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, connection: shapeConnection(connection, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET OR CREATE BY OTHER USER ID =================

export const getConnectionWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const connection = await findOrCreateConnection(req.user.id, otherUserId);
    const populated = await connection.populate("users", "-password");

    res.json({ success: true, connection: shapeConnection(populated, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE GOALS =================

export const updateConnectionGoals = async (req, res) => {
  try {
    const { learningGoal, weeklyGoal, monthlyGoal } = req.body;

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }

    const isMember = connection.users.some((u) => u.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (learningGoal !== undefined) connection.learningGoal = learningGoal;
    if (weeklyGoal !== undefined) connection.weeklyGoal = weeklyGoal;
    if (monthlyGoal !== undefined) connection.monthlyGoal = monthlyGoal;

    await connection.save();
    const populated = await connection.populate("users", "-password");

    res.json({ success: true, connection: shapeConnection(populated, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { shapeConnection };
