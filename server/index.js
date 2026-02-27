const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-app.vercel.app", "https://blitz-dutch.vercel.app"]
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

    room.started = true;
    io.to(roomCode).emit('game-started', room);
    console.log(`Game started in room: ${roomCode}`);
  });

  // Game state updates
  socket.on('game-action', (roomCode, action) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    // Broadcast action to all players in room
    socket.to(roomCode).emit('game-action', action);
  });

  // Update game state
  socket.on('update-game-state', (roomCode, gameState) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.gameState = gameState;
    socket.to(roomCode).emit('game-state-updated', gameState);
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
