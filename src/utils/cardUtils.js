// Card suits and ranks
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a double deck (104 cards) for smoother gameplay
export const createDeck = (doubleDeck = true) => {
  const deck = [];
  const multiplier = doubleDeck ? 2 : 1;
  
  for (let i = 0; i < multiplier; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${suit}-${rank}-${i}` });
      }
    }
  }
  return deck;
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get card value for scoring
export const getCardValue = (card) => {
  if (!card) return 0;
  const rank = card.rank;
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') {
    // Red Kings (♥ ♦) = 0 points, Black Kings (♠ ♣) = 13 points
    return getSuitColor(card.suit) === 'red' ? 0 : 13;
  }
  return parseInt(rank, 10);
};

// Check if card is a special card
export const isSpecialCard = (card) => {
  if (!card) return false;
  return ['A', 'J', 'Q', 'K'].includes(card.rank);
};

// Check if card is a red King (0 points)
export const isRedKing = (card) => {
  if (!card || card.rank !== 'K') return false;
  return getSuitColor(card.suit) === 'red';
};

// Check if two cards have the same rank
export const sameRank = (card1, card2) => {
  return card1 && card2 && card1.rank === card2.rank;
};

// Get suit color (red or black)
export const getSuitColor = (suit) => {
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
};

