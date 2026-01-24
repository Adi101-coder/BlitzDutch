import React, { useState, useEffect } from 'react';
import { getSuitColor } from '../utils/cardUtils';

const Card = ({ card, isFaceDown = false, isSelected = false, onClick, className = '' }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [wasFaceDown, setWasFaceDown] = useState(isFaceDown);

  useEffect(() => {
    if (wasFaceDown && !isFaceDown) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 600);
    }
    setWasFaceDown(isFaceDown);
  }, [isFaceDown, wasFaceDown]);

  // If no card provided and not face down, return null or placeholder
  if (!card && !isFaceDown) {
    return null;
  }

  if (isFaceDown || !card) {
    return (
      <div
        className={`w-24 h-32 bg-black border-2 border-white/20 rounded-lg shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:border-white/40 hover:-translate-y-1 ${isSelected ? 'ring-2 ring-white scale-110 border-white' : ''} ${isFlipping ? 'animate-flip' : ''} ${className}`}
        onClick={onClick}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05))] bg-[length:20px_20px]"></div>
          <div className="text-white text-4xl font-bold z-10 opacity-80">♠</div>
        </div>
      </div>
    );
  }

  const suitColor = getSuitColor(card.suit);
  const isRed = suitColor === 'red';
  const suitSymbol = card.suit;

  return (
    <div
      className={`w-24 h-32 bg-white border-2 ${isSelected ? 'border-black ring-2 ring-white scale-110' : 'border-gray-300'} rounded-lg shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 ${isFlipping ? 'animate-flip' : ''} ${className}`}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="w-full h-full flex flex-col justify-between p-3 relative overflow-hidden rounded-lg">
        <div className={`text-lg font-bold ${isRed ? 'text-black' : 'text-black'}`}>
          {card.rank}
        </div>
        <div className={`text-4xl text-center ${isRed ? 'text-black' : 'text-black'}`}>
          {suitSymbol}
        </div>
        <div className={`text-lg font-bold ${isRed ? 'text-black' : 'text-black'} transform rotate-180`}>
          {card.rank}
        </div>
        {/* Pattern overlay for red suits */}
        {isRed && (
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.3),transparent)]"></div>
        )}
      </div>
    </div>
  );
};

export default Card;

