import React from 'react';
import Card from './Card';
import { Card as UICard, CardContent } from './ui/Card';
import { cn } from '../lib/utils';
import { User } from 'lucide-react';

const PlayerHand = ({ 
  player, 
  cards, 
  isActive, 
  onCardClick,
  selectedCardIndex 
}) => {
  return (
    <UICard className={cn(
      'transition-all duration-300',
      isActive && 'ring-2 ring-white border-white/30 scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)]'
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3 w-full justify-center">
            <div className={cn(
              'w-2 h-2 rounded-full transition-all',
              isActive ? 'bg-white animate-pulse w-3 h-3' : 'bg-gray-500'
            )}></div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="text-lg font-bold text-white">
                {player.name}
              </h3>
            </div>
            {isActive && (
              <span className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full uppercase tracking-wide animate-pulse">
                Your Turn
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            {cards.map((card, index) => (
              <Card
                key={index}
                card={card}
                isFaceDown={!card.isRevealed}
                isSelected={selectedCardIndex === index}
                onClick={() => onCardClick && onCardClick(index)}
                className="transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </UICard>
  );
};

export default PlayerHand;

