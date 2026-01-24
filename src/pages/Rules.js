import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Settings, RotateCcw, Zap, Crown, Trophy, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Rules = () => {
  const navigate = useNavigate();

  const rules = [
    {
      icon: Target,
      title: 'Objective',
      content: 'The goal is to finish the game with the fewest points possible. Each card is worth points equal to its rank (Ace = 1, Jack = 11, Queen = 12, King = 13). At the end of each round, players tally up their points. Once a player reaches 100 points or more, the game ends, and the player with the lowest score wins.'
    },
    {
      icon: Settings,
      title: 'Setup',
      items: [
        'Each player receives 4 cards face down. Players may not look at their cards.',
        'If a player peeks, they receive a penalty card for each card they looked at.',
        'Place the remaining cards face down in the center as the draw pile.',
        'Flip the top card of the draw pile face up to form the discard pile.'
      ]
    },
    {
      icon: RotateCcw,
      title: 'Turns',
      content: 'In clockwise order, each player chooses either to draw a card from the draw pile, or take the top card from the discard pile. Then, the player must swap this card with one of their face-down cards (revealing it). If the card came from the discard pile, swapping is mandatory. If it came from the draw pile, the player may either keep it or discard it immediately. The replaced card is then placed face up on the discard pile.'
    },
    {
      icon: Zap,
      title: 'Matching Cards',
      content: 'Whenever a card is placed on the discard pile, any player holding a card of the same rank may immediately discard it too, even outside their turn. ⚠️ If a player makes a mistake (e.g. plays a card thinking it matches when it doesn\'t), they must take a penalty card. They also cannot play again during that turn.'
    },
    {
      icon: Crown,
      title: 'Special Cards',
      special: [
        { name: 'Jack (11)', desc: 'Allows the player to swap any two cards on the table, regardless of who owns them.' },
        { name: 'Queen (12)', desc: 'Allows the player to peek at one of their own cards without penalty.' },
        { name: 'Ace (1)', desc: 'Allows the player to give a card from the draw pile to another player of their choice.' },
        { name: 'Kings (13)', desc: 'Red Kings (♥ ♦) = 0 points. Black Kings (♠ ♣) = 13 points.' }
      ]
    },
    {
      icon: Trophy,
      title: 'Calling "Dutch"',
      items: [
        'A round ends when a player declares "Dutch" at the end of their turn.',
        'All players then get one final turn.',
        'The player who called Dutch is immune from forced swaps but may still discard matching cards during the final turns.'
      ]
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              GAME RULES
            </h1>
            <div className="h-1 w-32 bg-white"></div>
          </div>
          <Button
            onClick={() => navigate('/game')}
            variant="default"
            size="lg"
            className="hidden md:flex"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Playing
          </Button>
        </div>

        {/* Rules Content */}
        <div className="space-y-6">
          {rules.map((rule, index) => (
            <Card key={index} className="group hover:scale-[1.02] transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <rule.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white uppercase tracking-wide">
                    {rule.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {rule.content && (
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {rule.content}
                  </p>
                )}
                {rule.items && (
                  <ul className="space-y-3">
                    {rule.items.map((item, i) => (
                      <li key={i} className="flex items-start text-gray-300 leading-relaxed">
                        <span className="text-white mr-3 mt-1">•</span>
                        <span className="text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {rule.special && (
                  <div className="space-y-4">
                    {rule.special.map((sp, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-bold mb-2">{sp.name}</h4>
                        <p className="text-gray-300">{sp.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Play?</h3>
              <p className="text-gray-300 mb-6">Start your first game and experience the thrill of Blitz Dutch!</p>
              <Button
                onClick={() => navigate('/game')}
                variant="default"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rules;
