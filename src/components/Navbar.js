import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X } from 'lucide-react';
import { connectPhantom, connectMetaMask, disconnectWallet } from '../utils/wallet';
import Button from './ui/Button';
import { cn } from '../lib/utils';

const Navbar = () => {
  const location = useLocation();
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const handlePhantom = async () => {
    setConnecting(true);
    setShowWalletMenu(false);
    const result = await connectPhantom();
    if (result.connected) {
      setWallet(result);
    }
    setConnecting(false);
  };

  const handleMetaMask = async () => {
    setConnecting(true);
    setShowWalletMenu(false);
    const result = await connectMetaMask();
    if (result.connected) {
      setWallet(result);
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWallet(null);
    setShowWalletMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-black text-white tracking-tight">BLITZ DUTCH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive('/') 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Home
            </Link>
            <Link
              to="/rules"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive('/rules') 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Rules
            </Link>
            <Link
              to="/game"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive('/game') 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Play
            </Link>
          </div>

          {/* Wallet & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Wallet Button */}
            <div className="relative">
              {wallet && wallet.connected ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono text-white">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-xs"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </Button>
                  
                  {showWalletMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowWalletMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                        <button
                          onClick={handlePhantom}
                          disabled={connecting}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <span>🦄</span>
                          <span>Phantom</span>
                        </button>
                        <button
                          onClick={handleMetaMask}
                          disabled={connecting}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2 disabled:opacity-50 border-t border-white/10"
                        >
                          <span>🦊</span>
                          <span>MetaMask</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setShowMenu(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive('/') ? 'bg-white text-black' : 'text-gray-400'
                )}
              >
                Home
              </Link>
              <Link
                to="/rules"
                onClick={() => setShowMenu(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive('/rules') ? 'bg-white text-black' : 'text-gray-400'
                )}
              >
                Rules
              </Link>
              <Link
                to="/game"
                onClick={() => setShowMenu(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive('/game') ? 'bg-white text-black' : 'text-gray-400'
                )}
              >
                Play
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

