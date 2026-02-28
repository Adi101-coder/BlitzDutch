const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeGame, calculateScores } = require('./gameLogic');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*')
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active game rooms
const rooms = new Map();

// Helper function to generate room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', (playerName, callback) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        name: playerName || 'Player 1',
        ready: false
      }],
      gameState: null,
      started: false
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    
    console.log(`Room created: ${roomCode} by ${socket.id}`);
    callback({ success: true, roomCode, room });
  });

  // Join existing room
  socket.on('join-room', (roomCode, playerName, callback) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.started) {
      callback({ success: false, error: 'Game already started' });
      return;
    }

    if (room.players.length >= 10) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      ready: false
    };

    room.players.push(player);
    socket.join(roomCode);

    console.log(`${socket.id} joined room: ${roomCode}`);
    
    // Notify all players in room
    io.to(roomCode).emit('room-updated', room);
    callback({ success: true, room });
  });

  // Leave room
  socket.on('leave-room', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
    } else {
      // If host left, assign new host
      if (room.host === socket.id) {
        room.host = room.players[0].id;
      }
      io.to(roomCode).emit('room-updated', room);
    }
  });

  // Player ready toggle
  socket.on('player-ready', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = !player.ready;
      io.to(roomCode).emit('room-updated', room);
    }
  });

  // Start game
  socket.on('start-game', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || room.host !== socket.id) return;

    // Initialize game state
    room.gameState = initializeGame(room.players);
    room.started = true;
    
    // Emit both events to ensure all clients update properly
    io.to(roomCode).emit('room-updated', room);
    io.to(roomCode).emit('game-started', { room, gameState: room.gameState });
    console.log(`Game started in room: ${roomCode}`);
  });

  // Player peek card
  socket.on('peek-card', (roomCode, cardIndex) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const playerIndex = room.gameState.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const player = room.gameState.players[playerIndex];
    
    // Only allow peeking during peek phase
    if (room.gameState.gamePhase !== 'peek') return;
    
    // Only allow 2 peeks per player
    if (player.peekCount >= 2) return;

    player.peekCount++;
    
    // Send peeked card only to this player
    socket.emit('card-peeked', {
      cardIndex,
      card: player.hand[cardIndex],
      peekCount: player.peekCount
    });

    console.log(`Player ${player.name} peeked card ${cardIndex} (${player.peekCount}/2)`);

    // Broadcast updated game state so all clients know the peek count
    io.to(roomCode).emit('game-state-updated', room.gameState);

    // Check if all players have peeked at least once (to start the game flow)
    const allStartedPeeking = room.gameState.players.every(p => p.peekCount >= 1);
    
    // Optionally auto-advance after all players have done 2 peeks
    // For now, let's advance to draw phase after all players peek at least once
    if (allStartedPeeking && room.gameState.gamePhase === 'peek') {
      console.log('All players have started peeking, transitioning to draw phase');
      room.gameState.gamePhase = 'draw';
      io.to(roomCode).emit('game-state-updated', room.gameState);
    }
  });

  // Draw card
  socket.on('draw-card', (roomCode, fromDiscard) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
    if (currentPlayer.id !== socket.id) return;
    if (room.gameState.gamePhase !== 'draw') return;

    let drawnCard;
    if (fromDiscard && room.gameState.discardPile.length > 0) {
      drawnCard = room.gameState.discardPile.pop();
    } else if (room.gameState.drawPile.length > 0) {
      drawnCard = room.gameState.drawPile.pop();
    } else {
      return;
    }

    room.gameState.drawnCard = drawnCard;
    room.gameState.gamePhase = 'swap';
    
    io.to(roomCode).emit('game-state-updated', room.gameState);
  });

  // Swap card
  socket.on('swap-card', (roomCode, cardIndex) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
    if (currentPlayer.id !== socket.id) return;
    if (room.gameState.gamePhase !== 'swap' || !room.gameState.drawnCard) return;

    const swappedCard = currentPlayer.hand[cardIndex];
    currentPlayer.hand[cardIndex] = { ...room.gameState.drawnCard, isRevealed: false };
    
    room.gameState.discardPile.push(swappedCard);
    room.gameState.drawnCard = null;
    room.gameState.gamePhase = 'discard';
    
    io.to(roomCode).emit('game-state-updated', room.gameState);
  });

  // End turn
  socket.on('end-turn', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
    if (currentPlayer.id !== socket.id) return;

    // Handle final turns after Dutch is called
    if (room.gameState.dutchCalled) {
      room.gameState.finalTurns++;
      if (room.gameState.finalTurns >= room.gameState.players.length) {
        // End round
        room.gameState = calculateScores(room.gameState);
        io.to(roomCode).emit('round-ended', room.gameState);
        return;
      }
    }

    // Move to next player
    room.gameState.currentPlayerIndex = (room.gameState.currentPlayerIndex + 1) % room.gameState.players.length;
    room.gameState.gamePhase = 'draw';
    
    io.to(roomCode).emit('game-state-updated', room.gameState);
  });

  // Call Dutch
  socket.on('call-dutch', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState) return;

    const playerIndex = room.gameState.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1 || room.gameState.dutchCalled) return;

    room.gameState.dutchCalled = true;
    room.gameState.dutchCallerIndex = playerIndex;
    room.gameState.finalTurns = 0;
    
    io.to(roomCode).emit('dutch-called', { playerIndex, playerName: room.gameState.players[playerIndex].name });
    io.to(roomCode).emit('game-state-updated', room.gameState);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove player from all rooms
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        } else {
          if (room.host === socket.id) {
            room.host = room.players[0].id;
          }
          io.to(roomCode).emit('room-updated', room);
          io.to(roomCode).emit('player-disconnected', socket.id);
        }
      }
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info
app.get('/room/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
