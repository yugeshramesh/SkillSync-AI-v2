import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import { setIO } from "./socketManager.js";

// Sets up Socket.IO on top of the existing HTTP server. Called once from
// server.js. Every authenticated client joins a room named `user:<id>`
// so any part of the backend can push a realtime event to that user with
// emitToUser() from socketManager.js.
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"],
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    // Let everyone know this user just came online.
    io.emit("presence:update", { userId, online: true });

    socket.on("chat:send", async ({ receiver, message }, ack) => {
      try {
        if (!receiver || !message || !message.trim()) {
          if (ack) ack({ success: false, message: "receiver and message are required" });
          return;
        }

        const newMessage = await Message.create({
          sender: userId,
          receiver,
          message: message.trim(),
        });

        const populated = await newMessage.populate([
          { path: "sender", select: "name" },
          { path: "receiver", select: "name" },
        ]);

        io.to(`user:${receiver}`).emit("chat:message", populated);
        io.to(`user:${userId}`).emit("chat:message", populated);

        if (ack) ack({ success: true, data: populated });
      } catch (err) {
        if (ack) ack({ success: false, message: err.message });
      }
    });

    socket.on("chat:typing", ({ receiver }) => {
      if (receiver) {
        io.to(`user:${receiver}`).emit("chat:typing", { from: userId });
      }
    });

    socket.on("disconnect", () => {
      io.emit("presence:update", { userId, online: false });
    });
  });

  setIO(io);
  return io;
};
