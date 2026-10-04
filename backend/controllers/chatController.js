import Message from "../models/Message.js";
import User from "../models/User.js";
import { emitToUser } from "../sockets/socketManager.js";

// ================= SEND MESSAGE =================

export const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver,
      message,
    });

    const populated = await newMessage.populate([
      { path: "sender", select: "name" },
      { path: "receiver", select: "name" },
    ]);

    // Push it out over the socket too, so this also works as a fallback
    // path for clients that couldn't reach the socket for some reason.
    emitToUser(receiver, "chat:message", populated);
    emitToUser(req.user.id, "chat:message", populated);

    res.status(201).json({
      success: true,
      message: "Message Sent Successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET CONVERSATION =================

export const getConversation = async (req, res) => {
  try {
    const otherUser = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user.id,
          receiver: otherUser,
        },
        {
          sender: otherUser,
          receiver: req.user.id,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= GET CHAT LIST =================

export const getChatList = async (req, res) => {
  try {
    const currentUser = req.user.id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [
        { sender: currentUser },
        { receiver: currentUser },
      ],
    }).sort({ updatedAt: -1 });

    // Store unique chat user IDs
    const uniqueUserIds = new Set();

    messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUser) {
        uniqueUserIds.add(msg.sender.toString());
      }

      if (msg.receiver.toString() !== currentUser) {
        uniqueUserIds.add(msg.receiver.toString());
      }
    });

    // Fetch user details
    const chatUsers = await User.find({
      _id: {
        $in: [...uniqueUserIds],
      },
    }).select("-password");

    res.json({
      success: true,
      chats: chatUsers,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};