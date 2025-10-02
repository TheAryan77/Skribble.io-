const { rooms, addPlayerToRoom, removePlayerFromRoom } = require("../models/room");

module.exports = (io, socket) => {

  socket.on("join:room", ({ roomId, username }) => {
    const room = addPlayerToRoom(roomId, { id: socket.id, username });
    socket.join(roomId);
    
    console.log(`${username} joined room ${roomId}`);
    
    io.to(roomId).emit("room:update", room);
    io.to(roomId).emit("players:update", { players: room.players });
    io.to(roomId).emit("player:joined", { id: socket.id, username });
  });

  socket.on("leave:room", ({ roomId }) => {
    const room = removePlayerFromRoom(roomId, socket.id);
    if (!room) return;
    
    socket.leave(roomId);
    console.log(`Player ${socket.id} left room ${roomId}`);
    
    io.to(roomId).emit("room:update", room);
    io.to(roomId).emit("players:update", { players: room.players });
    io.to(roomId).emit("player:left", { id: socket.id });
    
    // If game was active and no players left, end the round
    if (room.players.length === 0) {
      room.gameStarted = false;
      room.roundActive = false;
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player ${socket.id} disconnected`);
    
    for (let roomId in rooms) {
      const room = removePlayerFromRoom(roomId, socket.id);
      if (room) {
        io.to(roomId).emit("room:update", room);
        io.to(roomId).emit("players:update", { players: room.players });
        io.to(roomId).emit("player:left", { id: socket.id });
        
        // If game was active and no players left, end the round
        if (room.players.length === 0) {
          room.gameStarted = false;
          room.roundActive = false;
        }
      }
    }
  });
};
