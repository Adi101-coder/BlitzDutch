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
    jackCardSelect,
    queenCardPeek,
  } = useMultiplayer();

  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [peekedCards, setPeekedCards] = useState({});
  const [queenPeekedCard, setQueenPeekedCard] = useState(null);

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

    const handleQueenCardRevealed = (data) => {
      // Show queen peeked card
      setQueenPeekedCard(data);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setQueenPeekedCard(null);
      }, 3000);
    };

    socketService.onCardPeeked(handleCardPeeked);
    socketService.onQueenCardRevealed(handleQueenCardRevealed);

    return () => {
      socketService.off('card-peeked', handleCardPeeked);
      socketService.off('queen-card-revealed', handleQueenCardRevealed);
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
    console.log('🔍 Peek attempt:', {
      index,
      gamePhase: gameState.gamePhase,
      myPlayer: myPlayer?.name,
      currentPeekCount: myPlayer?.peekCount,
      canPeek: gameState.gamePhase === 'peek' && myPlayer && myPlayer.peekCount < 2
    });
    
    if (gameState.gamePhase !== 'peek') {
      console.log('❌ Peek blocked: not in peek phase');
      return;
    }
    if (!myPlayer) {
      console.log('❌ Peek blocked: myPlayer not found');
      return;
    }
    if (myPlayer.peekCount >= 2) {
      console.log('❌ Peek blocked: already peeked twice');
      return;
    }
    
    console.log('✅ Sending peek request to server');
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

  const handleJackCardSelect = (playerIndex, cardIndex) => {
    if (!isMyTurn || gameState.gamePhase !== 'power-jack') return;
    jackCardSelect(playerIndex, cardIndex);
  };

  const handleQueenCardPeek = (playerIndex, cardIndex) => {
    if (!isMyTurn || gameState.gamePhase !== 'power-queen') return;
    queenCardPeek(playerIndex, cardIndex);
  };

  const handleLeaveGame = () => {
    leaveRoom();
    navigate('/lobby');
  };

  // Show scores if round ended
  if (gameState.gamePhase === 'ended') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <UICard className="p-6 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2">Round Ended!</h1>
              <p className="text-gray-400">Final Scores & Cards</p>
            </div>

            {/* Show all players with their revealed cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {gameState.players.map((player, index) => (
                <div key={player.id} className="space-y-4">
                  <PlayerHand
                    player={player}
                    cards={player.hand.map(card => ({ ...card, isRevealed: true }))}
                    isActive={false}
                  />
                  <div className="text-center">
                    <div className="inline-block px-6 py-3 bg-white/10 rounded-lg border border-white/20">
                      <p className="text-sm text-gray-400 uppercase tracking-wide">Round Score</p>
                      <p className="text-3xl font-black text-white">{player.roundScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scoreboard */}
            <div className="mb-6">
              <Scoreboard players={gameState.players} showScores={true} />
            </div>

            {/* Actions */}
            <div className="text-center space-x-4">
              <Button onClick={handleLeaveGame} variant="secondary" size="lg">
                Back to Lobby
              </Button>
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
              
              // Show revealed card for Queen power
              const cardsToShow = queenPeekedCard && queenPeekedCard.playerIndex === index
                ? player.hand.map((card, idx) => 
                    idx === queenPeekedCard.cardIndex 
                      ? { ...queenPeekedCard.card, isRevealed: true }
                      : card
                  )
                : player.hand;
              
              return (
                <PlayerHand
                  key={player.id}
                  player={player}
                  cards={cardsToShow}
                  isActive={isThisPlayerActive}
                  onCardClick={(cardIndex) => {
                    if (gameState.gamePhase === 'power-jack' && isMyTurn) {
                      handleJackCardSelect(index, cardIndex);
                    } else if (gameState.gamePhase === 'power-queen' && isMyTurn) {
                      handleQueenCardPeek(index, cardIndex);
                    }
                  }}
                  selectedCardIndex={
                    gameState.gamePhase === 'power-jack' &&
                    gameState.jackSwapSelection?.count === 1 &&
                    gameState.jackSwapSelection?.playerIndex === index
                      ? gameState.jackSwapSelection.cardIndex
                      : null
                  }
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
              ) : gameState.gamePhase === 'power-jack' ? (
                <>
                  <p className="text-sm text-white font-semibold">
                    🃏 Jack Power Active
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isMyTurn ? 'Select two cards to swap' : `${currentPlayer?.name} is using Jack power`}
                  </p>
                </>
              ) : gameState.gamePhase === 'power-queen' ? (
                <>
                  <p className="text-sm text-white font-semibold">
                    👑 Queen Power Active
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isMyTurn ? 'Select one card to peek' : `${currentPlayer?.name} is using Queen power`}
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
                    } else if (gameState.gamePhase === 'power-jack' && isMyTurn) {
                      handleJackCardSelect(myPlayerIndex, index);
                    } else if (gameState.gamePhase === 'power-queen' && isMyTurn) {
                      handleQueenCardPeek(myPlayerIndex, index);
                    }
                  }}
                  selectedCardIndex={
                    gameState.gamePhase === 'swap' 
                      ? selectedCardIndex
                      : gameState.gamePhase === 'power-jack' &&
                        gameState.jackSwapSelection?.count === 1 &&
                        gameState.jackSwapSelection?.playerIndex === myPlayerIndex
                        ? gameState.jackSwapSelection.cardIndex
                        : null
                  }
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

                {/* Jack Power Instructions */}
                {gameState.gamePhase === 'power-jack' && isMyTurn && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      🃏 Jack Power: Swap Two Cards
                    </p>
                    <p className="text-xs text-gray-400">
                      Select any two cards from any players to swap them
                      {gameState.jackSwapSelection?.count === 1 && ' (1/2 selected)'}
                    </p>
                  </UICard>
                )}

                {/* Queen Power Instructions */}
                {gameState.gamePhase === 'power-queen' && isMyTurn && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      👑 Queen Power: Peek at One Card
                    </p>
                    <p className="text-xs text-gray-400">
                      Click on any card from any player to peek at it
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
