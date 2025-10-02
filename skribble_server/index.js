const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import socket handlers
const roomHandler = require("./sockets/room");
const drawingHandler = require("./sockets/drawing");
const roundsHandler = require("./sockets/rounds");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register socket handlers
  roomHandler(io, socket);
  drawingHandler(io, socket);
  roundsHandler(io, socket);

  // Handle chat messages
  socket.on("chat:message", ({ roomId, text, userId, username }) => {
    const message = {
      userId,
      username,
      text,
      timestamp: new Date(),
      type: 'chat'
    };
    io.to(roomId).emit("chat:message", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});