import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import WalletConnect from '../components/WalletConnect';
import PaymentModal from '../components/PaymentModal';
import { listenToAgentPaidEvents, getAgentPaidHistory, CONTRACT_ADDRESS } from '../utils/contract';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentDemo = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    if (wallet?.connected) {
      const result = await getAgentPaidHistory(wallet);
      if (result.success) {
        setHistory(result.history);
      }
    }
  };

  useEffect(() => {
    if (wallet?.connected && wallet.chain === 'ethereum') {
      // Listen to real-time events
      const cleanup = listenToAgentPaidEvents(wallet, (event) => {
        setEvents((prev) => [event, ...prev]);
      });

      // Fetch historical events
      fetchHistory();

      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);
  };

  const handleWalletConnect = (connectedWallet) => {
    setWallet(connectedWallet);
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Payment Demo</h1>
              <p className="text-sm text-gray-400">Contract: {CONTRACT_ADDRESS}</p>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </Card>

        {/* Wallet Connection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Connect Wallet</h2>
          <WalletConnect onConnect={handleWalletConnect} />
        </Card>

        {/* Payment Actions */}
        {wallet?.connected && wallet.chain === 'ethereum' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={() => setShowPaymentModal(true)}
                variant="default"
                className="w-full"
              >
                Pay Agent
              </Button>
              <Button
                onClick={fetchHistory}
                variant="secondary"
                className="w-full"
              >
                Refresh History
              </Button>
            </div>
          </Card>
        )}

        {/* Real-time Events */}
        {events.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Events</h2>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Agent:</div>
                    <div className="text-white font-mono text-xs break-all">
                      {event.agent}
                    </div>
                    <div className="text-gray-400">Amount:</div>
                    <div className="text-white">{event.amount} ETH</div>
                    <div className="text-gray-400">Job ID:</div>
                    <div className="text-white">{event.jobId}</div>
                    <div className="text-gray-400">TX:</div>
                    <div className="text-white font-mono text-xs break-all">
                      {event.transactionHash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Transaction History */}
        {history.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((tx, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/30 border border-white/10 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Agent:</div>
                    <div className="text-white font-mono text-xs break-all">
                      {tx.agent}
                    </div>
                    <div className="text-gray-400">Payer:</div>
                    <div className="text-white font-mono text-xs break-all">
                      {tx.payer}
                    </div>
                    <div className="text-gray-400">Amount:</div>
                    <div className="text-white">{tx.amount} ETH</div>
                    <div className="text-gray-400">Job ID:</div>
                    <div className="text-white">{tx.jobId}</div>
                    <div className="text-gray-400">Block:</div>
                    <div className="text-white">{tx.blockNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Info */}
        {!wallet?.connected && (
          <Card className="p-6">
            <div className="text-center text-gray-400">
              <p className="mb-2">Connect your Ethereum wallet to interact with the contract</p>
              <p className="text-sm">Make sure you're on the correct network</p>
            </div>
          </Card>
        )}

        {wallet?.connected && wallet.chain !== 'ethereum' && (
          <Card className="p-6">
            <div className="text-center text-yellow-400">
              <p>Please connect an Ethereum wallet (MetaMask or Trust Wallet)</p>
            </div>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          wallet={wallet}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PaymentDemo;
