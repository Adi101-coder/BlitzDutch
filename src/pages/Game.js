import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import { createDeck, shuffleDeck, getCardValue, sameRank } from '../utils/cardUtils';
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
  const [peekCounts, setPeekCounts] = useState({}); // Track how many cards each player has peeked
  
  // AI mode
  const [vsComputer, setVsComputer] = useState(false); // Track if playing against computer
  const [aiThinking, setAiThinking] = useState(false); // Track if AI is making a move

  // Power card states
  const [jackSwapSelection, setJackSwapSelection] = useState({ playerIndex: null, cardIndex: null, count: 0 }); // Track Jack swap selections

  // AI Logic - Computer plays automatically
  React.useEffect(() => {
    if (!vsComputer || !gameStarted || currentPlayerIndex !== 1 || showScores || aiThinking) return;
    
    const makeAIMove = async () => {
      setAiThinking(true);
      
      // AI handles peeking phase
      if (gamePhase === 'peek') {
        const peekCount = peekCounts[1] || 0;
        if (peekCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setPeekCounts(prev => ({ ...prev, 1: peekCount + 1 }));
          if (peekCount + 1 >= 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setCurrentPlayerIndex(0);
            setGamePhase('draw');
          }
        }
        setAiThinking(false);
        return;
      }
      
      // AI draws a card
      if (gamePhase === 'draw') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const drawFromDiscard = Math.random() < 0.25 && discardPile.length > 0;
        
        if (drawFromDiscard) {
          const card = discardPile[discardPile.length - 1];
          setDiscardPile(discardPile.slice(0, -1));
          setDrawnCard(card);
        } else if (drawPile.length > 0) {
          const card = drawPile[drawPile.length - 1];
          setDrawPile(drawPile.slice(0, -1));
          setDrawnCard(card);
        }
        setGamePhase('swap');
        setAiThinking(false);
        return;
      }
      
      // AI swaps a card
      if (gamePhase === 'swap' && drawnCard) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const randomIndex = Math.floor(Math.random() * players[1].hand.length);
        const newHand = [...players[1].hand];
        const swappedCard = newHand[randomIndex];
        
        newHand[randomIndex] = { ...drawnCard, isRevealed: false };
        
        const updatedPlayers = [...players];
        updatedPlayers[1].hand = newHand;
        setPlayers(updatedPlayers);
        
        setDiscardPile(prev => [...prev, swappedCard]);
        setDrawnCard(null);
        setGamePhase('discard');
        
        // AI might call Dutch (15% chance)
        if (Math.random() < 0.15 && !dutchCalled) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setDutchCalled(true);
          setDutchCallerIndex(1);
          setFinalTurns(0);
        }
        
        setAiThinking(false);
        return;
      }
      
      // AI ends turn
      if (gamePhase === 'discard') {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (dutchCalled && finalTurns >= 1) {
          endRound();
          setAiThinking(false);
          return;
        }
        
        if (dutchCalled) {
          setFinalTurns(finalTurns + 1);
        }
        
        setCurrentPlayerIndex(0);
        setGamePhase('draw');
        setAiThinking(false);
      }
    };
    
    makeAIMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vsComputer, gameStarted, currentPlayerIndex, gamePhase, showScores, aiThinking]);

  // Initialize game
  const startGame = () => {
    try {
      const deck = shuffleDeck(createDeck(true)); // Double deck

      if (deck.length < (numPlayers * 4 + 1)) {
        console.error('Not enough cards in deck!');
        return;
      }

      const newPlayers = [];
      for (let i = 0; i < numPlayers; i++) {
        newPlayers.push({
          name: vsComputer && i === 1 ? 'Computer 🤖' : `Player ${i + 1}`,
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
        console.error('No card available for discard pile!');
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
      setGamePhase('peek'); // Start with peek phase
      setDutchCalled(false);
      setDutchCallerIndex(null);
      setFinalTurns(0);
      setPeekCounts({}); // Reset peek counts
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
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

  // Handle peeking at initial cards
  const handlePeekCard = (index) => {
    if (gamePhase !== 'peek') return;

    const playerPeekCount = peekCounts[currentPlayerIndex] || 0;
    if (playerPeekCount >= 2) return; // Already peeked at 2 cards

    // Update peek count first
    const newPeekCounts = { ...peekCounts, [currentPlayerIndex]: playerPeekCount + 1 };
    setPeekCounts(newPeekCounts);

    // Temporarily reveal the card
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const newHand = [...updatedPlayers[currentPlayerIndex].hand];
      newHand[index] = { ...newHand[index], isRevealed: true, peeked: true };
      updatedPlayers[currentPlayerIndex].hand = newHand;
      return updatedPlayers;
    });

    // Hide the card after 2 seconds
    setTimeout(() => {
      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        const newHand = [...updatedPlayers[currentPlayerIndex].hand];
        newHand[index] = { ...newHand[index], isRevealed: false };
        updatedPlayers[currentPlayerIndex].hand = newHand;
        return updatedPlayers;
      });
    }, 2000);
  };

  // Finish peeking phase and start game
  const handleFinishPeeking = () => {
    const playerPeekCount = peekCounts[currentPlayerIndex] || 0;
    if (playerPeekCount < 2) return; // Must peek at 2 cards

    // Check if all players have peeked
    if (currentPlayerIndex < players.length - 1) {
      // Move to next player for peeking
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setSelectedCardIndex(null);
    } else {
      // All players have peeked, start the game
      setCurrentPlayerIndex(0);
      setGamePhase('draw');
    }
  };

  // Handle swap confirmation
  const handleSwap = () => {
    if (gamePhase !== 'swap' || selectedCardIndex === null || !drawnCard) return;

    const currentPlayer = players[currentPlayerIndex];
    const newHand = [...currentPlayer.hand];
    const swappedCard = newHand[selectedCardIndex];

    // Swap the card - keep it face down (not revealed)
    newHand[selectedCardIndex] = { ...drawnCard, isRevealed: false };

    // Update player hand
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].hand = newHand;
    setPlayers(updatedPlayers);

    // Discard the swapped card
    setDiscardPile([...discardPile, swappedCard]);

    // Check for power cards (Jack or Queen)
    if (drawnCard.rank === 'J') {
      // Jack power: swap any two cards in the pot
      setJackSwapSelection({ playerIndex: null, cardIndex: null, count: 0 });
      setGamePhase('power-jack');
      return;
    } else if (drawnCard.rank === 'Q') {
      // Queen power: peek at any one card in the pot
      setGamePhase('power-queen');
      return;
    }

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


  // Handle Jack power card - swap any two cards
  const handleJackCardSelect = (playerIndex, cardIndex) => {
    if (gamePhase !== 'power-jack') return;

    const selection = jackSwapSelection;

    if (selection.count === 0) {
      // First card selected
      setJackSwapSelection({ playerIndex, cardIndex, count: 1 });
    } else if (selection.count === 1) {
      // Second card selected - perform swap
      const updatedPlayers = [...players];

      // Get both cards
      const card1 = updatedPlayers[selection.playerIndex].hand[selection.cardIndex];
      const card2 = updatedPlayers[playerIndex].hand[cardIndex];

      // Swap them
      updatedPlayers[selection.playerIndex].hand[selection.cardIndex] = card2;
      updatedPlayers[playerIndex].hand[cardIndex] = card1;

      setPlayers(updatedPlayers);

      // Reset and continue
      setJackSwapSelection({ playerIndex: null, cardIndex: null, count: 0 });
      setGamePhase('discard');
    }
  };

  // Handle Queen power card - peek at any one card
  const handleQueenCardPeek = (playerIndex, cardIndex) => {
    if (gamePhase !== 'power-queen') return;

    // Temporarily reveal the card
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const newHand = [...updatedPlayers[playerIndex].hand];
      newHand[cardIndex] = { ...newHand[cardIndex], isRevealed: true };
      updatedPlayers[playerIndex].hand = newHand;
      return updatedPlayers;
    });

    // Hide the card after 3 seconds
    setTimeout(() => {
      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        const newHand = [...updatedPlayers[playerIndex].hand];
        newHand[cardIndex] = { ...newHand[cardIndex], isRevealed: false };
        updatedPlayers[playerIndex].hand = newHand;
        return updatedPlayers;
      });

      // Reset and continue
      setGamePhase('discard');
    }, 3000);
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
  };

  // Calculate scores
  const calculateScores = () => {
    const updatedPlayers = players.map(player => {
      // Reveal all cards
      const revealedHand = player.hand.map(card => ({
        ...card,
        isRevealed: true
      }));

      const roundScore = revealedHand.reduce((sum, card) => {
        return sum + getCardValue(card);
      }, 0);

      return {
        ...player,
        hand: revealedHand,
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
        // updatedPlayers[dutchCallerIndex].roundScore += 10;
        // updatedPlayers[dutchCallerIndex].totalScore += 10;
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
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => { setVsComputer(false); setNumPlayers(2); }}
                    variant={!vsComputer ? 'default' : 'secondary'}
                    className="py-4"
                  >
                    👥 Local Multiplayer
                  </Button>
                  <Button
                    onClick={() => { setVsComputer(true); setNumPlayers(2); }}
                    variant={vsComputer ? 'default' : 'secondary'}
                    className="py-4"
                  >
                    🤖 vs Computer
                  </Button>
                </div>
              </div>

              {!vsComputer && (
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
              )}

              <div className="pt-4">
                <WalletConnect onConnect={() => { }} />
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
                  onCardClick={(cardIndex) => {
                    // Handle power card interactions
                    if (gamePhase === 'power-jack') {
                      handleJackCardSelect(index, cardIndex);
                    } else if (gamePhase === 'power-queen') {
                      handleQueenCardPeek(index, cardIndex);
                    }
                  }}
                  selectedCardIndex={
                    gamePhase === 'power-jack' &&
                      jackSwapSelection.count === 1 &&
                      jackSwapSelection.playerIndex === index
                      ? jackSwapSelection.cardIndex
                      : null
                  }
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

            {/* Swap Button - Below Game Center */}
            {gamePhase === 'swap' && drawnCard && !aiThinking && (
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

            {/* AI Thinking Indicator */}
            {aiThinking && vsComputer && (
              <div className="mt-6">
                <UICard className="p-4 text-center border-white/20 bg-white/5">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-sm text-white font-semibold mt-2">Computer is thinking...</p>
                </UICard>
              </div>
            )}

            {/* Action Buttons */}
            {gamePhase === 'discard' && !aiThinking && (
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
                    // Handle peeking phase
                    if (gamePhase === 'peek') {
                      handlePeekCard(index);
                      return;
                    }

                    // Handle power card phases
                    if (gamePhase === 'power-jack') {
                      handleJackCardSelect(currentPlayerIndex, index);
                      return;
                    }

                    if (gamePhase === 'power-queen') {
                      handleQueenCardPeek(currentPlayerIndex, index);
                      return;
                    }

                    // During swap phase, allow selecting cards to swap
                    if (gamePhase === 'swap') {
                      handleCardSelect(index);
                    }
                  }}
                  selectedCardIndex={
                    gamePhase === 'power-jack' &&
                      jackSwapSelection.count === 1 &&
                      jackSwapSelection.playerIndex === currentPlayerIndex
                      ? jackSwapSelection.cardIndex
                      : selectedCardIndex
                  }
                />

                {/* Peeking Instructions */}
                {gamePhase === 'peek' && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      👀 Peek at 2 cards ({(peekCounts[currentPlayerIndex] || 0)}/2)
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Click on any 2 cards to view them. You can only do this once!
                    </p>
                    {(peekCounts[currentPlayerIndex] || 0) >= 2 && (
                      <Button
                        onClick={handleFinishPeeking}
                        variant="default"
                        size="sm"
                      >
                        {currentPlayerIndex < players.length - 1 ? 'Next Player' : 'Start Game'}
                      </Button>
                    )}
                  </UICard>
                )}

                {/* Jack Power Card Instructions */}
                {gamePhase === 'power-jack' && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      🃏 Jack Power: Swap Two Cards
                    </p>
                    <p className="text-xs text-gray-400">
                      {jackSwapSelection.count === 0
                        ? 'Click on the first card to swap (from any player)'
                        : 'Click on the second card to complete the swap'}
                    </p>
                  </UICard>
                )}

                {/* Queen Power Card Instructions */}
                {gamePhase === 'power-queen' && (
                  <UICard className="mt-4 p-4 text-center border-white/20 bg-white/5">
                    <p className="text-sm text-white font-semibold mb-2">
                      👑 Queen Power: Peek at One Card
                    </p>
                    <p className="text-xs text-gray-400">
                      Click on any card (from any player) to peek at it for 3 seconds
                    </p>
                  </UICard>
                )}
              </div>
            )}

            {/* Drawn Card Display - Below Current Player */}
            {drawnCard && (
              <UICard className="p-6 flex flex-col items-center space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Drawn Card</div>
                <Card card={drawnCard} isFaceDown={false} />
                {gamePhase === 'swap' && (
                  <p className="text-sm text-gray-400 font-medium text-center">Select a card to swap</p>
                )}
              </UICard>
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

