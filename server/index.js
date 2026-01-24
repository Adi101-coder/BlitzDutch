const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Game rooms storage
const rooms = new Map();
const playerSockets = new Map();

// Room structure:
// {
//   roomCode: string,
//   host: string,
//   players: [{ id, name, socket, score, hand }],
//   gameState: { started, phase, currentPlayerIndex, drawPile, discardPile },
//   maxPlayers: number
// }

// Helper functions
const createRoom = (playerName, numPlayers) => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const playerId = uuidv4();
  
  const room = {
    roomCode,
    host: playerId,
    maxPlayers: numPlayers,
    players: [
      {
        id: playerId,
        name: playerName,
        socketId: null,
        score: 0,
        roundScore: 0,
        hand: [],
      },
    ],
    gameState: {
      started: false,
      phase: 'waiting',
      currentPlayerIndex: 0,
      drawPile: [],
      discardPile: [],
    },
  };

  rooms.set(roomCode, room);
  return { roomCode, playerId, room };
};

const joinRoom = (roomCode, playerName) => {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, message: 'Room not found' };
  }

  if (room.players.length >= room.maxPlayers) {
    return { success: false, message: 'Room is full' };
  }

  const playerId = uuidv4();
  room.players.push({
    id: playerId,
    name: playerName,
    socketId: null,
    score: 0,
    roundScore: 0,
    hand: [],
  });

  return { success: true, roomCode, playerId, room };
};

const getRoom = (roomCode) => {
  return rooms.get(roomCode);
};

const removePlayer = (roomCode, playerId) => {
  const room = getRoom(roomCode);
  if (!room) return;

  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex !== -1) {
    room.players.splice(playerIndex, 1);
  }

  if (room.players.length === 0) {
    rooms.delete(roomCode);
  }
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', (data, callback) => {
    try {
      const { playerName, numPlayers } = data;
      const { roomCode, playerId, room } = createRoom(playerName, numPlayers);

      playerSockets.set(socket.id, { roomCode, playerId });
      socket.join(roomCode);

      const players = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));

      callback({
        success: true,
        roomCode,
        playerId,
        players,
      });

      socket.emit('room_created', {
        roomCode,
        players,
      });

      console.log(`Room ${roomCode} created by ${playerName}`);
    } catch (error) {
      console.error('Create room error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('join_room', (data, callback) => {
    try {
      const { roomCode, playerName } = data;
      const result = joinRoom(roomCode, playerName);

      if (!result.success) {
        callback(result);
        return;
      }

      const { playerId, room } = result;
      playerSockets.set(socket.id, { roomCode, playerId });
      socket.join(roomCode);

      const players = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));

      callback({
        success: true,
        roomCode,
        playerId,
        players,
      });

      // Notify other players
      io.to(roomCode).emit('player_joined', {
        player: { id: playerId, name: playerName },
        players,
      });

      console.log(`${playerName} joined room ${roomCode}`);
    } catch (error) {
      console.error('Join room error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('start_game', (data) => {
    try {
      const { roomCode } = data;
      const room = getRoom(roomCode);

      if (!room) {
        socket.emit('room_error', { message: 'Room not found' });
        return;
      }

      room.gameState.started = true;
      room.gameState.phase = 'draw';

      // Broadcast game started
      const players = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      }));

      io.to(roomCode).emit('game_started', {
        gameState: room.gameState,
        players,
      });

      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('room_error', { message: error.message });
    }
  });

  socket.on('make_move', (data) => {
    try {
      const { roomCode, ...moveData } = data;
      const room = getRoom(roomCode);

      if (!room) {
        socket.emit('invalid_move', { message: 'Room not found' });
        return;
      }

      // Update game state based on move
      room.gameState.phase = moveData.phase;
      if (moveData.currentPlayerIndex !== undefined) {
        room.gameState.currentPlayerIndex = moveData.currentPlayerIndex;
      }

      // Broadcast updated state
      io.to(roomCode).emit('game_state_updated', {
        gameState: room.gameState,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
          roundScore: p.roundScore,
        })),
      });

      console.log(`Move made in room ${roomCode}:`, moveData);
    } catch (error) {
      console.error('Make move error:', error);
      socket.emit('invalid_move', { message: error.message });
    }
  });

  socket.on('call_dutch', (data) => {
    try {
      const { roomCode } = data;
      const room = getRoom(roomCode);

      if (!room) {
        socket.emit('room_error', { message: 'Room not found' });
        return;
      }

      room.gameState.phase = 'dutch_called';

      io.to(roomCode).emit('dutch_called', {
        gameState: room.gameState,
      });

      console.log(`Dutch called in room ${roomCode}`);
    } catch (error) {
      console.error('Call dutch error:', error);
      socket.emit('room_error', { message: error.message });
    }
  });

  socket.on('leave_room', (data) => {
    try {
      const { roomCode } = data;
      const playerInfo = playerSockets.get(socket.id);

      if (!playerInfo) return;

      const room = getRoom(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerInfo.playerId);
      const playerName = player?.name || 'Unknown player';

      removePlayer(roomCode, playerInfo.playerId);
      playerSockets.delete(socket.id);
      socket.leave(roomCode);

      if (room.players.length > 0) {
        io.to(roomCode).emit('player_left', {
          playerName,
          players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
            score: p.score,
          })),
        });
      }

      console.log(`${playerName} left room ${roomCode}`);
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });

  socket.on('disconnect', () => {
    try {
      const playerInfo = playerSockets.get(socket.id);

      if (playerInfo) {
        const { roomCode, playerId } = playerInfo;
        const room = getRoom(roomCode);

        if (room) {
          const player = room.players.find((p) => p.id === playerId);
          const playerName = player?.name || 'Unknown player';

          removePlayer(roomCode, playerId);

          if (room.players.length > 0) {
            io.to(roomCode).emit('player_left', {
              playerName,
              players: room.players.map((p) => ({
                id: p.id,
                name: p.name,
                score: p.score,
              })),
            });
          }

          console.log(`${playerName} disconnected from room ${roomCode}`);
        }

        playerSockets.delete(socket.id);
      }

      console.log('User disconnected:', socket.id);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map((room) => ({
    roomCode: room.roomCode,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    started: room.gameState.started,
  }));
  res.json(roomList);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});
