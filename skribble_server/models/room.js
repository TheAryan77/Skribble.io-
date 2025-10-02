let rooms = {};

function createRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: [],
      drawerIndex: -1,
      currentWord: null,
      maskedWord: null,
      strokes: [],
      roundNumber: 0,
      roundTimer: null,
      roundDuration: 60,
      gameStarted: false,
      roundActive: false,
      wordChoices: []
    };
  }
  return rooms[roomId];
}

function addPlayerToRoom(roomId, player) {
  const room = createRoom(roomId);
  const existingPlayer = room.players.find(p => p.id === player.id);
  
  if (!existingPlayer) {
    room.players.push({
      id: player.id,
      username: player.username,
      score: 0,
      hasGuessed: false,
      isDrawing: false
    });
  }
  
  return room;
}

function removePlayerFromRoom(roomId, playerId) {
  const room = rooms[roomId];
  if (!room) return null;
  
  room.players = room.players.filter(p => p.id !== playerId);
  
  // If drawer left, end round
  if (room.players[room.drawerIndex]?.id === playerId) {
    room.roundActive = false;
    room.currentWord = null;
  }
  
  // Adjust drawer index if needed
  if (room.drawerIndex >= room.players.length) {
    room.drawerIndex = 0;
  }
  
  return room;
}

function nextDrawer(roomId) {
  const room = rooms[roomId];
  if (!room || room.players.length === 0) return null;
  
  // Reset previous drawer status
  room.players.forEach(p => p.isDrawing = false);
  
  room.drawerIndex = (room.drawerIndex + 1) % room.players.length;
  const drawer = room.players[room.drawerIndex];
  
  if (drawer) {
    drawer.isDrawing = true;
  }
  
  return drawer;
}

module.exports = { 
  rooms, 
  createRoom, 
  addPlayerToRoom, 
  removePlayerFromRoom, 
  nextDrawer 
};
