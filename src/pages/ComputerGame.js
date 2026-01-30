import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, shuffleDeck, getCardValue } from '../utils/cardUtils';
import PlayerHand from '../components/PlayerHand';
import GameCenter from '../components/GameCenter';
import Scoreboard from '../components/Scoreboard';
import Card from '../components/Card';
import { Card as UICard, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Home, RotateCcw, Cpu } from 'lucide-react';

const ComputerGame = () => {
  const navigate = useNavigate();
  
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
  const [peekCounts, setPeekCounts] = useState({});
  const [aiThinking, setAiThinking] = useState(false);

  // Start game
  const startGame = () => {
    const deck = shuffleDeck(createDeck(true));
    
    const newPlayers = [
      { name: 'You', hand: [], totalScore: 0, roundScore: 0, isHuman: true },
      { name: 'Computer', hand: [], totalScore: 0, roundScore: 0, isHuman: false }
    ];

    for (let i = 0; i < 2; i++) {
      const hand = [];
      for (let j = 0; j < 4; j++) {
        const card = deck.pop();
        if (card) hand.push({ ...card, isRevealed: false });
      }
      newPlayers[i].hand = hand;
    }

    const firstDiscard = deck.pop();
    
    setPlayers(newPlayers);
    setDrawPile(deck);
    setDiscardPile([firstDiscard]);
    setCurrentPlayerIndex(0);
    setDrawnCard(null);
    setSelectedCardIndex(null);
    setShowScores(false);
    setGamePhase('peek');
    setDutchCalled(false);
    setPeekCounts({});
    setGameStarted(true);
  };

  return <div>Computer Game</div>;
};

export default ComputerGame;

  // AI Logic
  useEffect(() => {
    if (gameStarted && currentPlayerIndex === 1 && !showScores && gamePhase === 'draw') {
      setTimeout(() => {
        setAiThinking(true);
        const drawFromDiscard = Math.random() < 0.3 && discardPile.length > 0;
        
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
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * players[1].hand.length);
          const newHand = [...players[1].hand];
          const swappedCard = newHand[randomIndex];
          
          newHand[randomIndex] = { ...drawnCard, isRevealed: false };
          
          const updatedPlayers = [...players];
          updatedPlayers[1].hand = newHand;
          setPlayers(updatedPlayers);
          
          setDiscardPile(prev => [...prev, swappedCard]);
          setDrawnCard(null);
          setCurrentPlayerIndex(0);
          setGamePhase('draw');
          setAiThinking(false);
        }, 1500);
      }, 1000);
    }
  }, [currentPlayerIndex, gamePhase, gameStarted]);
