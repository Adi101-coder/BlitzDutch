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

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleRoomUpdated = (room) => {
      setPlayers(room.players);
      if (room.started) {
        setGameState({ ...room.gameState, started: true });
      }
    };

    const handleGameStarted = (room) => {
      setGameState({ ...room.gameState, started: true });
    };

    const handleGameStateUpdated = (state) => {
      setGameState(state);
    };

    const handlePlayerDisconnected = (playerId) => {
      setError(`Player ${playerId} disconnected`);
      setTimeout(() => setError(null), 3000);
    };

    socketService.onRoomUpdated(handleRoomUpdated);
    socketService.onGameStarted(handleGameStarted);
    socketService.onGameStateUpdated(handleGameStateUpdated);
    socketService.onPlayerDisconnected(handlePlayerDisconnected);

    return () => {
      socketService.off('room-updated', handleRoomUpdated);
      socketService.off('game-started', handleGameStarted);
      socketService.off('game-state-updated', handleGameStateUpdated);
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

  const value = {
    isMultiplayer,
    roomCode,
    players,
    gameState,
    isConnected,
    error,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    sendGameAction,
    updateGameState,
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
