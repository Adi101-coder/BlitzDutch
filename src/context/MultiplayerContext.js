import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket, setupGameListeners } from '../utils/socketManager';

const MultiplayerContext = createContext(null);

export const MultiplayerProvider = ({ children }) => {
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();
    
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const setupGameHandlers = useCallback(() => {
    const handlers = {
      onGameStarted: (data) => {
        setGameState(data.gameState);
        setPlayers(data.players);
      },
      onGameStateUpdated: (data) => {
        setGameState(data.gameState);
        setPlayers(data.players);
      },
      onPlayerJoined: (data) => {
        setPlayers(data.players);
      },
      onPlayerLeft: (data) => {
        setPlayers(data.players);
        setError(`${data.playerName} left the game`);
      },
      onTurnChanged: (data) => {
        setGameState((prev) => ({
          ...prev,
          currentPlayerIndex: data.currentPlayerIndex,
        }));
      },
      onRoundEnded: (data) => {
        setGameState((prev) => ({
          ...prev,
          roundScore: data.scores,
        }));
      },
      onInvalidMove: (data) => {
        setError(data.message);
      },
      onRoomError: (data) => {
        setError(data.message);
      },
    };

    return setupGameListeners(handlers);
  }, []);

  const createRoom = useCallback(async (playerName, numPlayers) => {
    setLoading(true);
    try {
      const socket = getSocket();
      const response = await new Promise((resolve) => {
        socket.emit('create_room', { playerName, numPlayers }, resolve);
      });

      if (response.success) {
        setRoomCode(response.roomCode);
        setPlayers(response.players);
        setCurrentPlayerId(response.playerId);
        setIsMultiplayer(true);
        setError(null);
        setupGameHandlers();
        return response;
      } else {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setupGameHandlers]);

  const joinRoom = useCallback(async (code, playerName) => {
    setLoading(true);
    try {
      const socket = getSocket();
      const response = await new Promise((resolve) => {
        socket.emit('join_room', { roomCode: code, playerName }, resolve);
      });

      if (response.success) {
        setRoomCode(response.roomCode);
        setPlayers(response.players);
        setCurrentPlayerId(response.playerId);
        setIsMultiplayer(true);
        setError(null);
        setupGameHandlers();
        return response;
      } else {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setupGameHandlers]);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (roomCode) {
      socket.emit('leave_room', { roomCode });
    }
    setRoomCode(null);
    setPlayers([]);
    setCurrentPlayerId(null);
    setGameState(null);
    setIsMultiplayer(false);
  }, [roomCode]);

  const startGame = useCallback(() => {
    const socket = getSocket();
    if (roomCode) {
      socket.emit('start_game', { roomCode });
    }
  }, [roomCode]);

  const submitMove = useCallback((moveData) => {
    const socket = getSocket();
    if (roomCode) {
      socket.emit('make_move', { roomCode, ...moveData });
    }
  }, [roomCode]);

  const callDutch = useCallback(() => {
    const socket = getSocket();
    if (roomCode) {
      socket.emit('call_dutch', { roomCode });
    }
  }, [roomCode]);

  const value = {
    isMultiplayer,
    roomCode,
    players,
    currentPlayerId,
    gameState,
    isConnected,
    error,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    submitMove,
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
