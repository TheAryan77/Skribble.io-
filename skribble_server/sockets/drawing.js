const { rooms } = require("../models/room");

module.exports = (io, socket) => {

  socket.on("draw:stroke", ({ roomId, stroke }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.strokes.push(stroke);
    socket.to(roomId).emit("draw:stroke", stroke);
  });

  socket.on("draw:clear", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    room.strokes = [];
    io.to(roomId).emit("draw:clear");
  });
};
