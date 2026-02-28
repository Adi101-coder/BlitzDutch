import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../utils/socket';

const MultiplayerContext = createContext(null);

export const MultiplayerProvider = ({ children }) => {
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected());
      // Update current player ID
      if (window.socketId && window.socketId !== currentPlayerId) {
        setCurrentPlayerId(window.socketId);
      }
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, [currentPlayerId]);

  // Setup event listeners
  useEffect(() => {
    const handleRoomUpdated = (room) => {
      setPlayers(room.players);
      if (room.started && room.gameState) {
        setGameState({ ...room.gameState, started: true });
      }
    };

    const handleGameStarted = (data) => {
      console.log('🎮 Game started event received:', data);
      setGameState({ ...data.gameState, started: true });
      // Trigger navigation for all players
      window.dispatchEvent(new CustomEvent('game-started'));
    };

    const handleGameStateUpdated = (state) => {
      setGameState(state);
    };

    const handleCardPeeked = (data) => {
      // Handle peeked card (only for current player)
      console.log('Card peeked:', data);
    };

    const handleDutchCalled = (data) => {
      console.log(`${data.playerName} called Dutch!`);
    };

    const handleRoundEnded = (state) => {
      setGameState(state);
    };

    const handlePlayerDisconnected = (playerId) => {
      setError(`Player ${playerId} disconnected`);
      setTimeout(() => setError(null), 3000);
    };

    socketService.onRoomUpdated(handleRoomUpdated);
    socketService.onGameStarted(handleGameStarted);
    socketService.onGameStateUpdated(handleGameStateUpdated);
    socketService.onCardPeeked(handleCardPeeked);
    socketService.onDutchCalled(handleDutchCalled);
    socketService.onRoundEnded(handleRoundEnded);
    socketService.onPlayerDisconnected(handlePlayerDisconnected);

    return () => {
      socketService.off('room-updated', handleRoomUpdated);
      socketService.off('game-started', handleGameStarted);
      socketService.off('game-state-updated', handleGameStateUpdated);
      socketService.off('card-peeked', handleCardPeeked);
      socketService.off('dutch-called', handleDutchCalled);
      socketService.off('round-ended', handleRoundEnded);
      socketService.off('player-disconnected', handlePlayerDisconnected);
    };
  }, []);

  const createRoom = useCallback(async (playerName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await socketService.createRoom(playerName);
      
      if (response.success) {
        setRoomCode(response.roomCode);
        setPlayers(response.room.players);
        setIsMultiplayer(true);
        return response;
      } else {
        setError(response.error);
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (code, playerName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await socketService.joinRoom(code, playerName);
      
      if (response.success) {
        setRoomCode(response.room.code);
        setPlayers(response.room.players);
        setIsMultiplayer(true);
        return response;
      } else {
        setError(response.error);
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (roomCode) {
      socketService.leaveRoom(roomCode);
    }
    setRoomCode(null);
    setPlayers([]);
    setGameState(null);
    setIsMultiplayer(false);
  }, [roomCode]);

  const toggleReady = useCallback(() => {
    if (roomCode) {
      socketService.toggleReady(roomCode);
    }
  }, [roomCode]);

  const startGame = useCallback(() => {
    if (roomCode) {
      socketService.startGame(roomCode);
    }
  }, [roomCode]);

  const sendGameAction = useCallback((action) => {
    if (roomCode) {
      socketService.sendGameAction(roomCode, action);
    }
  }, [roomCode]);

  const updateGameState = useCallback((state) => {
    if (roomCode) {
      socketService.updateGameState(roomCode, state);
    }
  }, [roomCode]);

  const peekCard = useCallback((cardIndex) => {
    if (roomCode) {
      socketService.peekCard(roomCode, cardIndex);
    }
  }, [roomCode]);

  const drawCard = useCallback((fromDiscard = false) => {
    if (roomCode) {
      socketService.drawCard(roomCode, fromDiscard);
    }
  }, [roomCode]);

  const swapCard = useCallback((cardIndex) => {
    if (roomCode) {
      socketService.swapCard(roomCode, cardIndex);
    }
  }, [roomCode]);

  const endTurn = useCallback(() => {
    if (roomCode) {
      socketService.endTurn(roomCode);
    }
  }, [roomCode]);

  const callDutch = useCallback(() => {
    if (roomCode) {
      socketService.callDutch(roomCode);
    }
  }, [roomCode]);

  const value = {
    isMultiplayer,
    roomCode,
    players,
    gameState,
    isConnected,
    error,
    loading,
    currentPlayerId,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    sendGameAction,
    updateGameState,
    peekCard,
    drawCard,
    swapCard,
    endTurn,
    callDutch,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
};
