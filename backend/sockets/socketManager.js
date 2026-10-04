// Tiny helper so REST controllers can push realtime events through the
// same Socket.IO server instance that server.js creates.

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

// Every connected client joins a room named `user:<their id>`, so we can
// push an event straight to a specific person regardless of how many tabs
// / devices they have open.
export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId.toString()}`).emit(event, payload);
};
