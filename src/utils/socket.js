import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Room management
  createRoom(playerName) {
    return new Promise((resolve) => {
      this.socket.emit('create-room', playerName, (response) => {
        resolve(response);
      });
    });
  }

  joinRoom(roomCode, playerName) {
    return new Promise((resolve) => {
      this.socket.emit('join-room', roomCode, playerName, (response) => {
        resolve(response);
      });
    });
  }

  leaveRoom(roomCode) {
    this.socket.emit('leave-room', roomCode);
  }

  toggleReady(roomCode) {
    this.socket.emit('player-ready', roomCode);
  }

  startGame(roomCode) {
    this.socket.emit('start-game', roomCode);
  }

  // Game actions
  sendGameAction(roomCode, action) {
    this.socket.emit('game-action', roomCode, action);
  }

  updateGameState(roomCode, gameState) {
    this.socket.emit('update-game-state', roomCode, gameState);
  }

  // Event listeners
  onRoomUpdated(callback) {
    this.socket.on('room-updated', callback);
  }

  onGameStarted(callback) {
    this.socket.on('game-started', callback);
  }

  onGameAction(callback) {
    this.socket.on('game-action', callback);
  }

  onGameStateUpdated(callback) {
    this.socket.on('game-state-updated', callback);
  }

  onPlayerDisconnected(callback) {
    this.socket.on('player-disconnected', callback);
  }

  // Remove listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
