// Game logic for server-side game state management

// Card utilities
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck(doubleDeck = true) {
  const deck = [];
  const numDecks = doubleDeck ? 2 : 1;
  
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${rank}${suit}-${d}` });
      }
    }
  }
  
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getCardValue(card) {
  if (card.rank === 'K') return 0;
  if (card.rank === 'A') return 1;
  if (card.rank === 'J' || card.rank === 'Q') return 10;
  return parseInt(card.rank);
}

function initializeGame(players) {
  const deck = shuffleDeck(createDeck(true));
  
  // Deal 4 cards to each player
  const gamePlayers = players.map((player, index) => ({
    id: player.id,
    name: player.name,
    hand: [],
    totalScore: 0,
    roundScore: 0,
    peekCount: 0,
    hasPeeked: false
  }));

  // Deal cards
  for (let i = 0; i < 4; i++) {
    for (const player of gamePlayers) {
      const card = deck.pop();
      player.hand.push({ ...card, isRevealed: false });
    }
  }

  // First card on discard pile
  const firstDiscard = deck.pop();

  return {
    players: gamePlayers,
    drawPile: deck,
    discardPile: [firstDiscard],
    currentPlayerIndex: 0,
    gamePhase: 'peek', // peek, draw, swap, discard
    drawnCard: null,
    dutchCalled: false,
    dutchCallerIndex: null,
    finalTurns: 0,
    roundNumber: 1,
    started: true
  };
}

function calculateScores(gameState) {
  const updatedPlayers = gameState.players.map(player => {
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
      totalScore: player.totalScore + roundScore
    };
  });

  return {
    ...gameState,
    players: updatedPlayers,
    gamePhase: 'ended'
  };
}

module.exports = {
  createDeck,
  shuffleDeck,
  getCardValue,
  initializeGame,
  calculateScores
};
