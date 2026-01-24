import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Sparkles, Zap, Target, Play, BookOpen } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-6xl w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-8">
          <div className="inline-block mb-4">
            <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
              <span className="text-sm font-semibold text-white uppercase tracking-widest">Premium Card Game</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight leading-none">
            <span className="block">BLITZ</span>
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent gradient-animate">
              DUTCH
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-3xl mx-auto leading-relaxed">
            A fast-paced card game of <span className="text-white font-semibold">hidden hands</span>, 
            <span className="text-white font-semibold"> instant swaps</span>, and 
            <span className="text-white font-semibold"> daring Dutch calls</span>.
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="h-px w-16 bg-white/30"></div>
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div className="h-px w-16 bg-white/30"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/game')}
              variant="default"
              size="lg"
              className="group relative overflow-hidden"
            >
              <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Start Game
            </Button>
            <Button
              onClick={() => navigate('/rules')}
              variant="outline"
              size="lg"
              className="group"
            >
              <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              View Rules
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Hidden Hands</h3>
              <p className="text-gray-400 leading-relaxed">Play with face-down cards, strategy and memory</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Instant Swaps</h3>
              <p className="text-gray-400 leading-relaxed">Quick decisions and fast-paced gameplay</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Daring Calls</h3>
              <p className="text-gray-400 leading-relaxed">Call Dutch at the perfect moment to win</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;

