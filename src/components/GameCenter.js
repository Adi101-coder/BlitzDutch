import React from 'react';
import Card from './Card';
import { Card as UICard, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Grid } from 'lucide-react';

const GameCenter = ({ drawPile, discardPile, onDrawCard, onTakeDiscard, canTakeDiscard }) => {
  return (
    <UICard className="p-8 flex flex-col items-center space-y-6 animate-float">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Grid className="w-6 h-6 text-white" />
          <CardTitle className="text-2xl font-bold text-white uppercase tracking-wider">
            Game Center
          </CardTitle>
        </div>
        <div className="h-0.5 w-20 bg-white mx-auto"></div>
      </CardHeader>
      
      <CardContent className="flex items-center space-x-12">
        {/* Draw Pile */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Draw Pile</div>
          <div className="px-3 py-1 bg-black border border-white/20 rounded-full text-xs font-medium text-white">
            {drawPile.length} cards
          </div>
          {drawPile.length > 0 ? (
            <div
              className="w-24 h-32 bg-black border-2 border-white/20 rounded-lg shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:border-white/40 hover:-translate-y-1 animate-pulse-border"
              onClick={onDrawCard}
            >
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05))] bg-[length:20px_20px]"></div>
                <div className="text-white text-4xl font-bold z-10 opacity-80">♠</div>
              </div>
            </div>
          ) : (
            <div className="w-24 h-32 bg-black border-2 border-white/10 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">Empty</span>
            </div>
          )}
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Discard Pile</div>
          {discardPile.length > 0 && discardPile[discardPile.length - 1] ? (
            <>
              <Card
                card={discardPile[discardPile.length - 1]}
                isFaceDown={false}
                onClick={canTakeDiscard ? onTakeDiscard : undefined}
                className={canTakeDiscard ? 'cursor-pointer' : 'cursor-default'}
              />
              {canTakeDiscard && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onTakeDiscard}
                  className="mt-2"
                >
                  Take Card
                </Button>
              )}
            </>
          ) : (
            <div className="w-24 h-32 bg-black border-2 border-white/10 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">Empty</span>
            </div>
          )}
        </div>
      </CardContent>
    </UICard>
  );
};

export default GameCenter;

