import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import socketService from '../utils/socket';
import PlayerHand from '../components/PlayerHand';
import GameCenter from '../components/GameCenter';
import Scoreboard from '../components/Scoreboard';
import Card from '../components/Card';
import { Card as UICard, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Home, RotateCcw, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const {
    roomCode,
    gameState,
    isConnected,
    currentPlayerId,
    leaveRoom,
    peekCard,
    drawCard,
    swapCard,
    endTurn,
    callDutch,
  } = useMultiplayer();

  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [peekedCards, setPeekedCards] = useState({});

  // Listen for card peek responses
  useEffect(() => {
    const handleCardPeeked = (data) => {
      // Temporarily show the peeked card
      setPeekedCards(prev => ({
        ...prev,
        [data.cardIndex]: data.card
      }));
      
      // Hide after 2 seconds
      setTimeout(() => {
        setPeekedCards(prev => {
          const updated = { ...prev };
          delete updated[data.cardIndex];
          return updated;
        });
      }, 2000);
    };

    socketService.onCardPeeked(handleCardPeeked);

    return () => {
      socketService.off('card-peeked', handleCardPeeked);
    };
  }, []);

  // Redirect if not in a room
  useEffect(() => {
    if (!roomCode) {
      navigate('/lobby');
    }
  }, [roomCode, navigate]);

  if (!gameState || !gameState.started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <UICard className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Loading game...</p>
          </CardContent>
        </UICard>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayerIndex = gameState.players.findIndex(p => p.id === currentPlayerId);
  const myPlayer = gameState.players[myPlayerIndex];
  const isMyTurn = gameState.currentPlayerIndex === myPlayerIndex;

  // Debug logging
  useEffect(() => {
    console.log('Game State Debug:', {
      currentPlayerId,
      myPlayerIndex,
      myPlayer: myPlayer?.name,
      isMyTurn,
      gamePhase: gameState.gamePhase,
      currentPlayerIndex: gameState.currentPlayerIndex,
      currentPlayerName: gameState.players[gameState.currentPlayerIndex]?.name,
      allPlayers: gameState.players.map(p => ({ id: p.id, name: p.name, peekCount: p.peekCount }))
    });
  }, [currentPlayerId, myPlayerIndex, myPlayer, isMyTurn, gameState.gamePhase, gameState.currentPlayerIndex, gameState.players]);

  const handlePeekCard = (index) => {
    if (gameState.gamePhase !== 'peek') return;
    if (!myPlayer || myPlayer.peekCount >= 2) return;
    
    console.log('Peeking card:', index, 'Current peek count:', myPlayer.peekCount);
    peekCard(index);
  };

  const handleDrawCard = (fromDiscard = false) => {
    if (!isMyTurn || gameState.gamePhase !== 'draw') return;
    drawCard(fromDiscard);
  };

  const handleCardSelect = (index) => {
    if (!isMyTurn || gameState.gamePhase !== 'swap') return;
    setSelectedCardIndex(index);
  };

  const handleSwap = () => {
    if (!isMyTurn || gameState.gamePhase !== 'swap' || selectedCardIndex === null) return;
    swapCard(selectedCardIndex);
    setSelectedCardIndex(null);
  };

  const handleEndTurn = () => {
    if (!isMyTurn || gameState.gamePhase !== 'discard') return;
    endTurn();
  };

  const handleCallDutch = () => {
    if (gameState.dutchCalled) return;
    callDutch();
  };

  const handleLeaveGame = () => {
    leaveRoom();
    navigate('/lobby');
  };

  // Show scores if round ended
  if (gameState.gamePhase === 'ended') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <UICard className="p-6 mb-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white mb-4">Round Ended!</h1>
              <Scoreboard players={gameState.players} showScores={true} />
              <div className="mt-6 space-x-4">
                <Button onClick={handleLeaveGame} variant="secondary">
                  Back to Lobby
                </Button>
              </div>
            </div>
          </UICard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <UICard className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">BLITZ DUTCH</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                  Multiplayer v2.1 - Room: {roomCode}
                </p>
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {gameState.dutchCalled && (
                <div className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm uppercase flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Final Round: {gameState.finalTurns}/{gameState.players.length}</span>
                </div>
              )}
              <Button onClick={handleLeaveGame} variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Leave
              </Button>
              {!gameState.dutchCalled && (
                <Button onClick={handleCallDutch} variant="secondary" size="sm">
                  Call Dutch
                </Button>
              )}
            </div>
          </div>
        </UICard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Other Players */}
          <div className="space-y-4">
            {gameState.players.map((player, index) => {
              if (index === myPlayerIndex) return null;
              const isThisPlayerActive = gameState.gamePhase === 'peek' ? false : index === gameState.currentPlayerIndex;
              return (
                <PlayerHand
                  key={player.id}
                  player={player}
                  cards={player.hand}
                  isActive={isThisPlayerActive}
                />
              );
            })}
          </div>

          {/* Center Column - Game Center */}
          <div className="flex flex-col items-center">
            <GameCenter
              drawPile={gameState.drawPile}
              discardPile={gameState.discardPile}
              onDrawCard={() => handleDrawCard(false)}
              onTakeDiscard={() => handleDrawCard(true)}
              canTakeDiscard={isMyTurn && gameState.gamePhase === 'draw'}
            />

            {/* Current Turn Indicator */}
            <UICard className="mt-6 p-4 text-center border-white/20 bg-white/5">
              {gameState.gamePhase === 'peek' ? (
                <>
                  <p className="text-sm text-white font-semibold">
                    👀 Peek Phase
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All players: peek at your cards ({myPlayer?.peekCount || 0}/2)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-white font-semibold">
                    {isMyTurn ? "🎮 Your Turn!" : `⏳ ${currentPlayer?.name || 'Waiting'}'s Turn`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Phase: {gameState.gamePhase}
                  </p>
                </>
              )}
            </UICard>

            {/* Swap Button */}
            {gameState.gamePhase === 'swap' && gameState.drawnCard && isMyTurn && (
              <div className="mt-6">
                <Button
                  onClick={handleSwap}
                  disabled={selectedCardIndex === null}
                  variant={selectedCardIndex !== null ? 'default' : 'ghost'}
                  size="lg"
                >
                  Swap Card
                </Button>
              </div>
            )}

            {/* End Turn Button */}
            {gameState.gamePhase === 'discard' && isMyTurn && (
              <div className="mt-6">
                <Button onClick={handleEndTurn} variant="secondary" size="lg">
                  End Turn
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - My Hand & Scoreboard */}
          <div className="space-y-4">
            {/* My Hand */}
            {myPlayer && (
              <div>
                <PlayerHand
                  player={myPlayer}
                  cards={myPlayer.hand.map((card, idx) => 
                    peekedCards[idx] ? { ...peekedCards[idx], isRevealed: true } : card
                  )}
                  isActive={gameState.gamePhase === 'peek' || isMyTurn}
                  onCardClick={(index) => {
                    if (gameState.gamePhase === 'peek') {
                      handlePeekCard(index);
                    } else if (gameState.gamePhase === 'swap' && isMyTurn) {
                      handleCardSelect(index);
                    }
                  }}
                  selectedCardIndex={selectedCardIndex}
                />

                {/* Peek Instructions */}
                {gameState.gamePhase === 'peek' && myPlayer && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      👀 Peek at your cards ({myPlayer.peekCount}/2)
                    </p>
                    <p className="text-xs text-gray-400">
                      Click on any cards to view them
                    </p>
                  </UICard>
                )}
              </div>
            )}

            {/* Drawn Card Display */}
            {gameState.drawnCard && isMyTurn && (
              <UICard className="p-6 flex flex-col items-center space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Drawn Card</div>
                <Card card={gameState.drawnCard} isFaceDown={false} />
                {gameState.gamePhase === 'swap' && (
                  <p className="text-sm text-gray-400 font-medium text-center">Select a card to swap</p>
                )}
              </UICard>
            )}

            {/* Scoreboard */}
            <Scoreboard players={gameState.players} showScores={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGame;
