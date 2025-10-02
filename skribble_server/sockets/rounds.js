const { rooms, nextDrawer } = require("../models/room");
const { getRandomWords, maskWord } = require("../utils/wordList");

module.exports = (io, socket) => {

  socket.on("game:start", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.players.length < 2) return;

    room.gameStarted = true;
    startNextRound(roomId, io);
  });

  socket.on("round:start", ({ roomId }) => {
    startNextRound(roomId, io);
  });

  socket.on("word:pick", ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return;
    
    room.currentWord = word;
    room.maskedWord = maskWord(word);
    room.roundActive = true;
    
    // Reset player guess status
    room.players.forEach(p => p.hasGuessed = false);
    
    // Start round timer
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
    }
    
    room.roundTimer = setTimeout(() => {
      endRound(roomId, io);
    }, room.roundDuration * 1000);

    io.to(roomId).emit("round:start", {
      drawerId: room.players[room.drawerIndex].id,
      roundNumber: room.roundNumber,
      maskedWord: room.maskedWord,
      duration: room.roundDuration
    });
    
    // Update players list
    io.to(roomId).emit("players:update", { players: room.players });
  });

  socket.on("round:end", ({ roomId }) => {
    endRound(roomId, io);
  });

  socket.on("guess:word", ({ roomId, guess, userId, username }) => {
    const room = rooms[roomId];
    if (!room || !room.roundActive) return;
    
    // Don't let drawer guess their own word
    if (room.players[room.drawerIndex]?.id === userId) return;
    
    if (room.currentWord && guess.toLowerCase().trim() === room.currentWord.toLowerCase()) {
      const player = room.players.find(p => p.id === userId);
      if (player && !player.hasGuessed) {
        player.hasGuessed = true;
        
        // Calculate points based on time remaining
        const timeElapsed = (Date.now() - room.roundStartTime) / 1000;
        const timeBonus = Math.max(0, Math.floor((room.roundDuration - timeElapsed) / 10));
        const points = 100 + timeBonus;
        
        player.score += points;
        
        io.to(roomId).emit("guess:correct", { 
          userId, 
          username: player.username,
          points,
          word: room.currentWord
        });
        
        io.to(roomId).emit("players:update", { players: room.players });
        
        // Check if all players guessed
        const playersWhoCanGuess = room.players.filter(p => !p.isDrawing);
        const allGuessed = playersWhoCanGuess.every(p => p.hasGuessed);
        
        if (allGuessed) {
          endRound(roomId, io);
        }
      }
    }
  });
};

function startNextRound(roomId, io) {
  const room = rooms[roomId];
  if (!room) return;

  // Clear previous round data
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
  }
  
  room.roundNumber++;
  room.roundActive = false;
  room.currentWord = null;
  room.maskedWord = null;
  room.roundStartTime = Date.now();
  
  // Get next drawer
  const drawer = nextDrawer(roomId);
  if (!drawer) return;

  // Generate word choices
  const words = getRandomWords(3, 'medium');
  room.wordChoices = words;

  // Send word choices to drawer
  io.to(drawer.id).emit("word:choices", { words });
  
  // Notify room about new round
  io.to(roomId).emit("round:prepare", {
    drawerId: drawer.id,
    roundNumber: room.roundNumber,
    drawerName: drawer.username
  });
  
  io.to(roomId).emit("players:update", { players: room.players });
}

function endRound(roomId, io) {
  const room = rooms[roomId];
  if (!room) return;

  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
  }

  room.roundActive = false;
  const currentWord = room.currentWord;
  
  // Reset drawing status
  room.players.forEach(p => {
    p.isDrawing = false;
    p.hasGuessed = false;
  });

  io.to(roomId).emit("round:end", {
    word: currentWord,
    players: room.players
  });
  
  // Start next round after delay
  setTimeout(() => {
    if (room.gameStarted && room.players.length >= 2) {
      startNextRound(roomId, io);
    }
  }, 3000);
}
