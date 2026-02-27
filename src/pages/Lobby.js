import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, Copy, Check, Home, Loader } from 'lucide-react';

const Lobby = () => {
  const navigate = useNavigate();
  const {
    roomCode,
    players,
    isConnected,
    error,
    loading,
    currentPlayerId,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  } = useMultiplayer();

  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [playerName, setPlayerName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const isHost = roomCode && players.length > 0 && players[0].name === playerName;

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    try {
      await createRoom(playerName, numPlayers);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!joinCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    try {
      await joinRoom(joinCode.toUpperCase(), playerName);
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setMode(null);
    setPlayerName('');
  };

  const handleStartGame = () => {
    startGame();
    // Navigate to multiplayer game page
    setTimeout(() => {
      navigate('/multiplayer-game');
    }, 500);
  };

  // Connection status
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <UICard className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
            <p className="text-gray-400 mb-2">Connecting to server...</p>
            <p className="text-sm text-gray-500">Make sure the game server is running</p>
          </CardContent>
        </UICard>
      </div>
    );
  }

  // Room joined - show lobby
  if (roomCode) {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <UICard>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black text-white">
                Game Lobby
              </CardTitle>
              <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">
                Waiting for players...
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Room Code */}
              <div className="text-center p-6 bg-black/50 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">
                  Room Code
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <code className="text-4xl font-bold text-white tracking-wider">
                    {roomCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-white/10 rounded transition"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Share this code with other players to join
                </p>
              </div>

              {/* Players List */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    Players ({players.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="p-4 bg-black/50 border border-white/10 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-white font-semibold">{player.name}</span>
                      </div>
                      {player.id === currentPlayerId && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4">
                {isHost && players.length > 1 && (
                  <Button
                    onClick={handleStartGame}
                    variant="default"
                    size="lg"
                    disabled={players.length < 2}
                  >
                    Start Game ({players.length} players)
                  </Button>
                )}
                {!isHost && (
                  <div className="p-4 text-center bg-black/50 rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm">
                      Waiting for the host to start the game...
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleLeaveRoom}
                  variant="secondary"
                  size="lg"
                >
                  Leave Room
                </Button>
              </div>
            </CardContent>
          </UICard>
        </div>
      </div>
    );
  }

  // Initial mode selection
  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full space-y-4">
          <UICard>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black text-white">
                Multiplayer
              </CardTitle>
              <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">
                Play with Friends
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={() => setMode('create')}
                variant="default"
                size="lg"
                className="w-full"
              >
                Create Room
              </Button>
              <Button
                onClick={() => setMode('join')}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Join Room
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="lg"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back Home
              </Button>
            </CardContent>
          </UICard>
        </div>
      </div>
    );
  }

  // Create Room Mode
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full">
          <UICard>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black text-white">
                Create Room
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded text-white placeholder-gray-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-4">
                  Number of Players
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      onClick={() => setNumPlayers(num)}
                      variant={numPlayers === num ? 'default' : 'secondary'}
                      className="aspect-square"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                variant="default"
                size="lg"
                className="w-full"
                disabled={!playerName.trim() || loading}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </Button>

              <Button
                onClick={() => setMode(null)}
                variant="ghost"
                size="lg"
                className="w-full"
              >
                Back
              </Button>
            </CardContent>
          </UICard>
        </div>
      </div>
    );
  }

  // Join Room Mode
  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full">
          <UICard>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black text-white">
                Join Room
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded text-white placeholder-gray-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  maxLength="6"
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded text-white placeholder-gray-600 focus:outline-none focus:border-white uppercase text-center tracking-widest text-lg"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                variant="default"
                size="lg"
                className="w-full"
                disabled={!playerName.trim() || !joinCode.trim() || loading}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>

              <Button
                onClick={() => setMode(null)}
                variant="ghost"
                size="lg"
                className="w-full"
              >
                Back
              </Button>
            </CardContent>
          </UICard>
        </div>
      </div>
    );
  }
};

export default Lobby;
