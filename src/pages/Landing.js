import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Sparkles, Zap, Target, Play, BookOpen, ChevronDown, AlertCircle } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div 
          className="max-w-6xl w-full relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-16 space-y-8">
            <motion.div variants={itemVariants} className="inline-block mb-4">
              <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                <span className="text-sm font-semibold text-white uppercase tracking-widest">Premium Card Game</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight leading-none"
            >
              <span className="block">BLITZ</span>
              <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent gradient-animate">
                DUTCH
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              A fast-paced card game of <span className="text-white font-semibold">hidden hands</span>, 
              <span className="text-white font-semibold"> instant swaps</span>, and 
              <span className="text-white font-semibold"> daring Dutch calls</span>.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center space-x-2 mb-8"
            >
              <div className="h-px w-16 bg-white/30"></div>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="h-px w-16 bg-white/30"></div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap"
            >
              <Button
                onClick={() => navigate('/game')}
                variant="default"
                size="lg"
                className="group relative overflow-hidden"
              >
                <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Single Player
              </Button>
              <Button
                onClick={() => navigate('/lobby')}
                variant="secondary"
                size="lg"
                className="group"
              >
                <Zap className="w-5 h-5 mr-2" />
                Multiplayer
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
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="flex justify-center mt-16"
          >
            <button
              onClick={scrollToFeatures}
              className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="text-sm uppercase tracking-wider">Explore Features</span>
              <ChevronDown className="w-6 h-6 animate-bounce group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="min-h-screen flex items-center justify-center p-4 py-20">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Game Features</h2>
            <p className="text-gray-400 text-lg">Experience the thrill of strategic card play</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Hidden Hands",
                description: "Play with face-down cards, strategy and memory"
              },
              {
                icon: Zap,
                title: "Instant Swaps",
                description: "Quick decisions and fast-paced gameplay"
              },
              {
                icon: Target,
                title: "Daring Calls",
                description: "Call Dutch at the perfect moment to win"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Card className="h-full">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Disclaimer</h3>
                  <div className="space-y-3 text-gray-400 leading-relaxed">
                    <p>
                      This is a digital recreation of the Dutch card game for entertainment purposes only. 
                      No real money or gambling is involved in this game.
                    </p>
                    <p>
                      The game is designed for players aged 13 and above. All game mechanics are based on 
                      traditional card game rules and are meant for recreational play.
                    </p>
                    <p className="text-sm text-gray-500">
                      By playing this game, you acknowledge that this is purely for fun and entertainment. 
                      Please play responsibly and enjoy the strategic gameplay.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Footer CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Play?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Jump into the action and test your skills in this exciting card game
        </p>
        <Button
          onClick={() => navigate('/game')}
          variant="default"
          size="lg"
          className="group"
        >
          <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
          Start Playing Now
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">BLITZ DUTCH</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Experience the thrill of strategic card gameplay with hidden hands and instant swaps.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/game')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Play Game
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/rules')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Game Rules
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Home
                  </button>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-sm">About</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                A digital recreation of the classic Dutch card game for entertainment purposes.
              </p>
              <p className="text-gray-500 text-xs">
                No gambling • Ages 13+ • Free to play
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Blitz Dutch. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-xs">Made with ❤️ for card game enthusiasts</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

