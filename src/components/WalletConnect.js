import React, { useState } from 'react';
import { connectPhantom, connectMetaMask, disconnectWallet } from '../utils/wallet';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Wallet, X } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const handlePhantom = async () => {
    setConnecting(true);
    const result = await connectPhantom();
    if (result.connected) {
      setWallet(result);
      onConnect && onConnect(result);
    }
    setConnecting(false);
  };

  const handleMetaMask = async () => {
    setConnecting(true);
    const result = await connectMetaMask();
    if (result.connected) {
      setWallet(result);
      onConnect && onConnect(result);
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    const result = disconnectWallet();
    setWallet(null);
    onConnect && onConnect(result);
  };

  if (wallet && wallet.connected) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">{wallet.wallet}</div>
              <div className="text-sm font-mono text-white">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="w-4 h-4 text-gray-400" />
          <div className="text-xs text-gray-400 uppercase tracking-wide">Connect Wallet</div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handlePhantom}
            disabled={connecting}
            variant="secondary"
            className="flex-1"
          >
            {connecting ? 'Connecting...' : '🦄 Phantom'}
          </Button>
          <Button
            onClick={handleMetaMask}
            disabled={connecting}
            variant="secondary"
            className="flex-1"
          >
            {connecting ? 'Connecting...' : '🦊 MetaMask'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;

