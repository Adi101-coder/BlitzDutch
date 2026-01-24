import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, Copy, Check } from 'lucide-react';
import { connectPhantom, connectMetaMask, disconnectWallet } from '../utils/wallet';
import Button from './ui/Button';
import { cn } from '../lib/utils';

const Navbar = () => {
  const location = useLocation();
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (e) {
        localStorage.removeItem('connectedWallet');
      }
    }
  }, []);

  const handleWalletConnect = async (connectFunction, walletName) => {
    setConnecting(true);
    setError(null);
    try {
      const result = await connectFunction();
      if (result.connected) {
        setWallet(result);
        localStorage.setItem('connectedWallet', JSON.stringify(result));
        setShowWalletMenu(false);
      } else {
        setError(result.error || `Failed to connect ${walletName}`);
        setShowWalletMenu(true); // Keep menu open on error
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || `Failed to connect ${walletName}`);
      setShowWalletMenu(true); // Keep menu open on error
      setTimeout(() => setError(null), 5000);
    }
    setConnecting(false);
  };

  const handlePhantom = () => handleWalletConnect(connectPhantom, 'Phantom');
  const handleMetaMask = () => handleWalletConnect(connectMetaMask, 'MetaMask');

  const handleDisconnect = () => {
    disconnectWallet();
    setWallet(null);
    localStorage.removeItem('connectedWallet');
    setShowWalletMenu(false);
  };

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      {/* Error Toast */}
      {error && (
        <div className="absolute left-0 right-0 top-16 z-40 mx-auto w-fit">
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm max-w-md">
            {error}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span className="text-black font-black text-lg">B</span>
            </div>
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
              to="/lobby"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                isActive('/lobby') 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Multiplayer
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
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setShowWalletMenu(!showWalletMenu)}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono text-white">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                  </div>
                  
                  {showWalletMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowWalletMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                        {/* Wallet Info */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-xs text-gray-400 mb-2">Connected Wallet</p>
                          <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded">
                            <span className="text-sm font-mono text-white truncate flex-1">
                              {wallet.address}
                            </span>
                            <button
                              onClick={handleCopyAddress}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Disconnect */}
                        <button
                          onClick={handleDisconnect}
                          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          Disconnect
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2"
                    disabled={connecting}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">{connecting ? 'Connecting...' : 'Connect'}</span>
                  </Button>
                  
                  {showWalletMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowWalletMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                        <p className="px-4 pt-3 pb-2 text-xs text-gray-400 font-semibold">SELECT WALLET</p>
                        
                        <button
                          onClick={handlePhantom}
                          disabled={connecting}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-3 disabled:opacity-50 border-t border-white/10"
                        >
                          <span className="text-lg">🦄</span>
                          <div>
                            <p className="font-semibold text-sm">Phantom</p>
                            <p className="text-xs text-gray-400">Solana</p>
                          </div>
                        </button>
                        
                        <button
                          onClick={handleMetaMask}
                          disabled={connecting}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-3 disabled:opacity-50 border-t border-white/10"
                        >
                          <span className="text-lg">🦊</span>
                          <div>
                            <p className="font-semibold text-sm">MetaMask</p>
                            <p className="text-xs text-gray-400">Ethereum</p>
                          </div>
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
                to="/lobby"
                onClick={() => setShowMenu(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive('/lobby') ? 'bg-white text-black' : 'text-gray-400'
                )}
              >
                Multiplayer
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

