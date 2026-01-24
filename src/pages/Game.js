import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import { createDeck, shuffleDeck, getCardValue, sameRank, isSpecialCard } from '../utils/cardUtils';
import PlayerHand from '../components/PlayerHand';
import GameCenter from '../components/GameCenter';
import Scoreboard from '../components/Scoreboard';
import Card from '../components/Card';
import WalletConnect from '../components/WalletConnect';
import { Card as UICard, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Home, RotateCcw, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const { isMultiplayer, roomCode, players: mpPlayers, gameState, isConnected, leaveRoom } = useMultiplayer();

  // Single player state
  const [numPlayers, setNumPlayers] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [drawnCard, setDrawnCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [showScores, setShowScores] = useState(false);
  const [gamePhase, setGamePhase] = useState('draw');
  const [dutchCalled, setDutchCalled] = useState(false);
  const [dutchCallerIndex, setDutchCallerIndex] = useState(null);
  const [finalTurns, setFinalTurns] = useState(0);
  const [specialCardEffect, setSpecialCardEffect] = useState(null);

  // Initialize game
  const startGame = () => {
    try {
      const deck = shuffleDeck(createDeck(true)); // Double deck
      
      if (deck.length < (numPlayers * 4 + 1)) {
        return;
      }
      
      const newPlayers = [];
      for (let i = 0; i < numPlayers; i++) {
        newPlayers.push({
          name: `Player ${i + 1}`,
          hand: [],
          totalScore: 0,
          roundScore: 0,
          penaltyCards: 0,
        });
      }

      // Deal 4 cards to each player (face down)
      const playerCards = [];
      for (let i = 0; i < numPlayers; i++) {
        const hand = [];
        for (let j = 0; j < 4; j++) {
          const card = deck.pop();
          if (card) {
            hand.push({ ...card, isRevealed: false });
          }
        }
        playerCards.push(hand);
      }

      newPlayers.forEach((player, index) => {
        player.hand = playerCards[index];
      });

      // Place first card on discard pile
      const firstDiscard = deck.pop();
      if (!firstDiscard) {
        return;
      }
      const remainingDeck = deck;

      setPlayers(newPlayers);
      setDrawPile(remainingDeck);
      setDiscardPile([firstDiscard]);
      setCurrentPlayerIndex(0);
      setDrawnCard(null);
      setSelectedCardIndex(null);
      setShowScores(false);
      setGamePhase('draw');
      setDutchCalled(false);
      setDutchCallerIndex(null);
      setFinalTurns(0);
      setSpecialCardEffect(null);
      setGameStarted(true);
    } catch (error) {
      // Game initialization error handled silently
    }
  };

  // Handle special card effects
  const handleSpecialCard = (card) => {
    if (!card || !isSpecialCard(card)) return null;

    switch (card.rank) {
      case 'J': // Jack - swap any two cards
        return { type: 'jack', message: 'Select two cards to swap' };
      case 'Q': // Queen - peek at one card
        return { type: 'queen', message: 'Select a card to peek at' };
      case 'A': // Ace - give card to another player
        return { type: 'ace', message: 'Select a player to give a card to' };
      case 'K': // King - already handled in scoring
        return null;
      default:
        return null;
    }
  };

  // Handle drawing from draw pile
  const handleDrawCard = () => {
    if (gamePhase !== 'draw' || drawPile.length === 0) return;
    
    const card = drawPile[drawPile.length - 1];
    setDrawPile(drawPile.slice(0, -1));
    setDrawnCard(card);
    setGamePhase('swap');
  };

  // Handle taking from discard pile
  const handleTakeDiscard = () => {
    if (gamePhase !== 'draw' || discardPile.length === 0) return;
    
    const card = discardPile[discardPile.length - 1];
    if (!card) return;
    
    setDiscardPile(discardPile.slice(0, -1));
    setDrawnCard(card);
    // If from discard pile, swapping is mandatory
    setGamePhase('swap');
  };

  // Handle card selection for swap
  const handleCardSelect = (index) => {
    if (gamePhase !== 'swap' || !drawnCard) return;
    setSelectedCardIndex(index);
  };

  // Handle swap confirmation
  const handleSwap = () => {
    if (gamePhase !== 'swap' || selectedCardIndex === null || !drawnCard) return;
    
    const currentPlayer = players[currentPlayerIndex];
    const newHand = [...currentPlayer.hand];
    const swappedCard = newHand[selectedCardIndex];
    
    // Swap the card
    newHand[selectedCardIndex] = { ...drawnCard, isRevealed: true };
    
    // Update player hand
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].hand = newHand;
    setPlayers(updatedPlayers);
    
    // Check for special card effect
    const effect = handleSpecialCard(swappedCard);
    if (effect) {
      setSpecialCardEffect(effect);
    }
    
    // Discard the swapped card
    setDiscardPile([...discardPile, swappedCard]);
    
    // Check if same rank (can discard immediately - doubles rule)
    if (sameRank(drawnCard, swappedCard)) {
      // Can discard immediately - remove the card we just swapped in
      const newHandAfterDiscard = newHand.filter((_, i) => i !== selectedCardIndex);
      updatedPlayers[currentPlayerIndex].hand = newHandAfterDiscard;
      setPlayers(updatedPlayers);
    }
    
    setDrawnCard(null);
    setSelectedCardIndex(null);
    setGamePhase('discard');
  };

  // Handle immediate discard of matching card
  const handleDiscardMatching = (cardIndex) => {
    if (discardPile.length === 0) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.hand) return;
    
    const card = currentPlayer.hand[cardIndex];
    const topDiscard = discardPile[discardPile.length - 1];
    
    if (!card || !card.isRevealed || !topDiscard || !sameRank(card, topDiscard)) {
      // Mistake - penalty card
      if (drawPile.length > 0) {
        const penaltyCard = drawPile[drawPile.length - 1];
        if (penaltyCard) {
          const newHand = [...currentPlayer.hand];
          newHand.push({ ...penaltyCard, isRevealed: false });
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex].hand = newHand;
          setPlayers(updatedPlayers);
          setDrawPile(drawPile.slice(0, -1));
        }
      }
      return;
    }
    
    // Remove card from hand
    const newHand = currentPlayer.hand.filter((_, i) => i !== cardIndex);
    
    // Update player hand
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].hand = newHand;
    setPlayers(updatedPlayers);
    
    // Add to discard pile
    setDiscardPile([...discardPile, card]);
    
    // Check if player has no cards left
    if (newHand.length === 0) {
      endRound();
    }
  };

  // End turn
  const handleEndTurn = () => {
    if (gamePhase !== 'discard' && gamePhase !== 'draw') return;
    
    // If player has a drawn card, they must discard it
    if (drawnCard) {
      setDiscardPile([...discardPile, drawnCard]);
      setDrawnCard(null);
    }
    
    // Handle final turns after Dutch is called
    if (dutchCalled) {
      if (finalTurns >= players.length - 1) {
        endRound();
        return;
      }
      setFinalTurns(finalTurns + 1);
    }
    
    // Move to next player
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setSelectedCardIndex(null);
    setGamePhase('draw');
    setSpecialCardEffect(null);
  };

  // Calculate scores
  const calculateScores = () => {
    const updatedPlayers = players.map(player => {
      const roundScore = player.hand.reduce((sum, card) => {
        return sum + getCardValue(card);
      }, 0);
      
      return {
        ...player,
        roundScore,
        totalScore: player.totalScore + roundScore,
      };
    });
    
    // Check if Dutch caller has lowest score
    if (dutchCallerIndex !== null && dutchCallerIndex >= 0) {
      const lowestScore = Math.min(...updatedPlayers.map(p => p.roundScore));
      const dutchCallerScore = updatedPlayers[dutchCallerIndex]?.roundScore || 0;
      
      // If tied, Dutch caller has advantage (no penalty)
      // Only add penalty if Dutch caller doesn't have the lowest score
      if (dutchCallerScore > lowestScore) {
        updatedPlayers[dutchCallerIndex].roundScore += 10;
        updatedPlayers[dutchCallerIndex].totalScore += 10;
      }
    }
    
    setPlayers(updatedPlayers);
    setShowScores(true);
  };

  // End round (Call Dutch)
  const endRound = () => {
    if (!dutchCalled) {
      setDutchCalled(true);
      setDutchCallerIndex(currentPlayerIndex);
      setFinalTurns(0);
      // Continue with final turns
      return;
    }
    calculateScores();
  };

  // Start new round
  const startNewRound = () => {
    startGame();
  };

  const handleLeaveGame = () => {
    if (isMultiplayer) {
      leaveRoom();
    }
    navigate('/');
  };

  const currentPlayer = players[currentPlayerIndex];
  const canTakeDiscard = gamePhase === 'draw' && discardPile.length > 0;

  // Multiplayer - show wait screen if not started
  if (isMultiplayer && !gameState?.started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <UICard>
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex items-center justify-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-6 h-6 text-green-400 animate-pulse" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-400" />
                )}
                <span className="text-gray-300 font-semibold">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for players...</h2>
                <p className="text-gray-400">Room: {roomCode}</p>
                <p className="text-gray-500 text-sm mt-2">{mpPlayers.length} players joined</p>
              </div>
              <Button onClick={handleLeaveGame} variant="secondary" className="w-full">
                Leave Room
              </Button>
            </CardContent>
          </UICard>
        </div>
      </div>
    );
  }

  // Single player setup
  if (!gameStarted && !isMultiplayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="max-w-2xl w-full relative z-10">
          <UICard className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
                BLITZ DUTCH
              </h1>
              <p className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-6">
                Card Game Setup
              </p>
              <div className="h-1 w-24 bg-white mx-auto"></div>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-widest">
                  Number of Players
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
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
              
              <div className="pt-4">
                <WalletConnect onConnect={() => {}} />
              </div>
              
              <Button
                onClick={startGame}
                variant="default"
                size="lg"
                className="w-full"
              >
                Start Game
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
                  {isMultiplayer ? 'Multiplayer' : 'Single Player'}
                </p>
                {isMultiplayer && (
                  <>
                    {isConnected ? (
                      <Wifi className="w-3 h-3 text-green-400" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-400" />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {dutchCalled && (
                <div className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm uppercase flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Final Turns: {finalTurns}/{players.length - 1}</span>
                </div>
              )}
              <Button
                onClick={handleLeaveGame}
                variant="ghost"
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={endRound}
                variant="secondary"
                size="sm"
              >
                Call Dutch
              </Button>
              <Button
                onClick={startNewRound}
                variant="default"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Round
              </Button>
            </div>
          </div>
        </UICard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Other Players */}
          <div className="space-y-4">
            {players.map((player, index) => {
              if (index === currentPlayerIndex) return null;
              return (
                <PlayerHand
                  key={index}
                  player={player}
                  cards={player.hand}
                  isActive={false}
                />
              );
            })}
          </div>

          {/* Center Column - Game Center */}
          <div className="flex flex-col items-center">
            <GameCenter
              drawPile={drawPile}
              discardPile={discardPile}
              onDrawCard={handleDrawCard}
              onTakeDiscard={handleTakeDiscard}
              canTakeDiscard={canTakeDiscard}
            />

            {/* Drawn Card Display */}
            {drawnCard && (
              <UICard className="mt-8 p-6 flex flex-col items-center space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Drawn Card</div>
                <Card card={drawnCard} isFaceDown={false} />
                {gamePhase === 'swap' && (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-400 font-medium">Select a card to swap</p>
                    <Button
                      onClick={handleSwap}
                      disabled={selectedCardIndex === null}
                      variant={selectedCardIndex !== null ? 'default' : 'ghost'}
                    >
                      Swap Card
                    </Button>
                  </div>
                )}
              </UICard>
            )}

            {/* Action Buttons */}
            {gamePhase === 'discard' && (
              <div className="mt-6">
                <Button
                  onClick={handleEndTurn}
                  variant="secondary"
                  size="lg"
                >
                  End Turn
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Current Player & Scoreboard */}
          <div className="space-y-4">
            {/* Current Player Hand */}
            {currentPlayer && (
              <div>
                <PlayerHand
                  player={currentPlayer}
                  cards={currentPlayer.hand}
                  isActive={true}
                  onCardClick={(index) => {
                    const card = currentPlayer.hand[index];
                    if (card && card.isRevealed && discardPile.length > 0) {
                      const topDiscard = discardPile[discardPile.length - 1];
                      if (topDiscard && sameRank(card, topDiscard)) {
                        handleDiscardMatching(index);
                        return;
                      }
                    }
                    if (gamePhase === 'swap') {
                      handleCardSelect(index);
                    }
                  }}
                  selectedCardIndex={selectedCardIndex}
                />
                
                {/* Matching Card Hint */}
                {discardPile.length > 0 && discardPile[discardPile.length - 1] && currentPlayer.hand.some(card => 
                  card && card.isRevealed && sameRank(card, discardPile[discardPile.length - 1])
                ) && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold flex items-center justify-center space-x-2">
                      <span className="text-lg">⚡</span>
                      <span>You have a matching card! Click it to discard immediately.</span>
                    </p>
                  </UICard>
                )}
              </div>
            )}

            {/* Scoreboard */}
            <Scoreboard players={players} showScores={showScores} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;

