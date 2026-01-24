import io from 'socket.io-client';

let socket = null;

const getServerURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, connect to the same origin (Vercel handles routing)
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const initializeSocket = (serverURL = getServerURL()) => {
  if (socket) return socket;
  
  socket = io(serverURL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Game room events
export const createRoom = (playerName, numPlayers) => {
  const socket = getSocket();
  return new Promise((resolve) => {
    socket.emit('create_room', { playerName, numPlayers }, (response) => {
      resolve(response);
    });
  });
};

export const joinRoom = (roomCode, playerName) => {
  const socket = getSocket();
  return new Promise((resolve, reject) => {
    socket.emit('join_room', { roomCode, playerName }, (response) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.message));
      }
    });
  });
};

export const startMultiplayerGame = (roomCode) => {
  const socket = getSocket();
  socket.emit('start_game', { roomCode });
};

export const makeMove = (roomCode, moveData) => {
  const socket = getSocket();
  socket.emit('make_move', { roomCode, ...moveData });
};

export const callDutch = (roomCode) => {
  const socket = getSocket();
  socket.emit('call_dutch', { roomCode });
};

// Event listeners setup
export const setupGameListeners = (handlers) => {
  const socket = getSocket();

  socket.on('game_started', handlers.onGameStarted);
  socket.on('game_state_updated', handlers.onGameStateUpdated);
  socket.on('player_joined', handlers.onPlayerJoined);
  socket.on('player_left', handlers.onPlayerLeft);
  socket.on('turn_changed', handlers.onTurnChanged);
  socket.on('round_ended', handlers.onRoundEnded);
  socket.on('invalid_move', handlers.onInvalidMove);
  socket.on('room_error', handlers.onRoomError);

  return () => {
    socket.off('game_started');
    socket.off('game_state_updated');
    socket.off('player_joined');
    socket.off('player_left');
    socket.off('turn_changed');
    socket.off('round_ended');
    socket.off('invalid_move');
    socket.off('room_error');
  };
};
