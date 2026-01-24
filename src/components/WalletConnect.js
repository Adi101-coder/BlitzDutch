import React, { useState, useEffect } from 'react';
import { connectPhantom, connectMetaMask, connectSolflare, connectTrustWallet, disconnectWallet, getWalletBalance, formatAddress, getWalletDisplayName } from '../utils/wallet';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Wallet, X, Copy, Check } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (wallet?.connected) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [wallet]);

  const fetchBalance = async () => {
    const bal = await getWalletBalance(wallet);
    setBalance(bal);
  };

  const handleConnect = async (connectFn) => {
    setConnecting(true);
    setError(null);
    const result = await connectFn();
    
    if (result.connected) {
      setWallet(result);
      onConnect && onConnect(result);
      setError(null);
    } else {
      setError(result.error);
    }
    setConnecting(false);
  };

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    const result = disconnectWallet();
    setWallet(null);
    setBalance(null);
    onConnect && onConnect(result);
  };

  if (wallet?.connected) {
    return (
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Connected Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    {getWalletDisplayName(wallet.wallet)}
                  </div>
                  <div className="text-sm font-mono text-white mt-1">
                    {formatAddress(wallet.address)}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCopyAddress}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Balance */}
            {balance && (
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span className="text-xs text-gray-400">Balance</span>
                <span className="text-sm font-bold text-white">
                  {balance} {wallet.chain === 'solana' ? 'SOL' : 'ETH'}
                </span>
              </div>
            )}

            {/* Chain Info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Chain</span>
              <span className="px-2 py-1 bg-white/10 rounded text-gray-300 capitalize">
                {wallet.chain}
              </span>
            </div>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="secondary"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="w-4 h-4 text-gray-400" />
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Connect Wallet
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Wallet Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => handleConnect(connectPhantom)}
            disabled={connecting}
            variant="secondary"
            className="w-full justify-start"
          >
            {connecting ? '⏳ Connecting...' : '🦄 Phantom (Solana)'}
          </Button>
          <Button
            onClick={() => handleConnect(connectMetaMask)}
            disabled={connecting}
            variant="secondary"
            className="w-full justify-start"
          >
            {connecting ? '⏳ Connecting...' : '🦊 MetaMask (Ethereum)'}
          </Button>
          <Button
            onClick={() => handleConnect(connectSolflare)}
            disabled={connecting}
            variant="secondary"
            className="w-full justify-start"
          >
            {connecting ? '⏳ Connecting...' : '🔥 Solflare (Solana)'}
          </Button>
          <Button
            onClick={() => handleConnect(connectTrustWallet)}
            disabled={connecting}
            variant="secondary"
            className="w-full justify-start"
          >
            {connecting ? '⏳ Connecting...' : '🔷 Trust Wallet'}
          </Button>
        </div>

        {/* Info Text */}
        <div className="mt-4 p-3 bg-white/5 border border-white/20 rounded text-xs text-gray-400">
          <p className="font-semibold text-white mb-1">💡 How to connect:</p>
          <ul className="space-y-1 text-xs">
            <li>• Install a supported wallet extension</li>
            <li>• Click the wallet button to connect</li>
            <li>• Approve the connection request</li>
            <li>• Your wallet address will appear here</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;

