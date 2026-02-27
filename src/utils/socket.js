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
      // Store socket ID globally for easy access
      window.socketId = this.socket.id;
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
  peekCard(roomCode, cardIndex) {
    this.socket.emit('peek-card', roomCode, cardIndex);
  }

  drawCard(roomCode, fromDiscard = false) {
    this.socket.emit('draw-card', roomCode, fromDiscard);
  }

  swapCard(roomCode, cardIndex) {
    this.socket.emit('swap-card', roomCode, cardIndex);
  }

  endTurn(roomCode) {
    this.socket.emit('end-turn', roomCode);
  }

  callDutch(roomCode) {
    this.socket.emit('call-dutch', roomCode);
  }

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

  onCardPeeked(callback) {
    this.socket.on('card-peeked', callback);
  }

  onGameStateUpdated(callback) {
    this.socket.on('game-state-updated', callback);
  }

  onDutchCalled(callback) {
    this.socket.on('dutch-called', callback);
  }

  onRoundEnded(callback) {
    this.socket.on('round-ended', callback);
  }

  onGameAction(callback) {
    this.socket.on('game-action', callback);
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
