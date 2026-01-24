import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Trophy, Award } from 'lucide-react';
import { cn } from '../lib/utils';

const Scoreboard = ({ players, showScores = false }) => {
  if (!showScores) return null;

  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-white" />
          <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">
            Round Scores
          </CardTitle>
        </div>
        <div className="h-0.5 w-16 bg-white mt-2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-black/50 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-200"
            >
              <span className="font-semibold text-white">{player.name}</span>
              <span className="text-xl font-bold text-white">
                {player.roundScore} pts
              </span>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">Total Scores</h3>
          </div>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div
                key={index}
                className={cn(
                  'flex justify-between items-center p-3 rounded-lg transition-all duration-200',
                  index === 0 
                    ? 'bg-white border-2 border-white' 
                    : 'bg-black/50 border border-white/10'
                )}
              >
                <div className="flex items-center space-x-2">
                  {index === 0 && <Trophy className="w-5 h-5 text-black" />}
                  <span className={cn(
                    'font-semibold',
                    index === 0 ? 'text-black' : 'text-white'
                  )}>
                    {player.name}
                  </span>
                </div>
                <span className={cn(
                  'font-bold',
                  index === 0 ? 'text-black text-lg' : 'text-white'
                )}>
                  {player.totalScore} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;

