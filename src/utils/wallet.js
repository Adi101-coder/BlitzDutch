// Wallet integration utilities

// Phantom Wallet (Solana)
export const connectPhantom = async () => {
  try {
    const phantom = window.phantom?.solana;
    
    if (!phantom) {
      throw new Error('Phantom wallet not found. Install from phantomapp.com');
    }

    // Check if already connected
    if (phantom.isConnected) {
      const resp = await phantom.connect({ onlyIfTrusted: false });
      return {
        address: resp.publicKey.toString(),
        wallet: 'phantom',
        connected: true,
        chain: 'solana'
      };
    } else {
      const resp = await phantom.connect();
      return {
        address: resp.publicKey.toString(),
        wallet: 'phantom',
        connected: true,
        chain: 'solana'
      };
    }
  } catch (err) {
    console.error('Phantom connection error:', err);
    return { 
      connected: false, 
      error: err.message || 'Failed to connect to Phantom. Make sure you have the extension installed.' 
    };
  }
};

// MetaMask (Ethereum)
export const connectMetaMask = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Install from metamask.io');
    }

    // Check if MetaMask provider
    if (!window.ethereum.isMetaMask) {
      throw new Error('Please use the MetaMask browser extension');
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please authorize MetaMask.');
    }

    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    
    return {
      address: accounts[0],
      wallet: 'metamask',
      connected: true,
      chain: 'ethereum',
      chainId: chainId
    };
  } catch (err) {
    console.error('MetaMask connection error:', err);
    return { 
      connected: false, 
      error: err.message || 'Failed to connect to MetaMask' 
    };
  }
};

// Solflare (Solana alternative)
export const connectSolflare = async () => {
  if (typeof window.solflare !== 'undefined') {
    try {
      const resp = await window.solflare.connect();
      return {
        address: resp.publicKey.toString(),
        wallet: 'solflare',
        connected: true,
        chain: 'solana'
      };
    } catch (err) {
      console.error('Solflare connection error:', err);
      return { connected: false, error: err.message };
    }
  } else {
    return { connected: false, error: 'Solflare wallet not found' };
  }
};

// Trust Wallet
export const connectTrustWallet = async () => {
  if (typeof window.trustwallet !== 'undefined') {
    try {
      const accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' });
      return {
        address: accounts[0],
        wallet: 'trustwallet',
        connected: true,
        chain: 'ethereum'
      };
    } catch (err) {
      console.error('Trust Wallet connection error:', err);
      return { connected: false, error: err.message };
    }
  } else {
    return { connected: false, error: 'Trust Wallet not found' };
  }
};

// Get wallet balance
export const getWalletBalance = async (wallet) => {
  if (!wallet.connected) return null;
  
  try {
    if (wallet.wallet === 'phantom' || wallet.wallet === 'solflare') {
      // Solana balance
      const response = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [wallet.address]
        })
      });
      const data = await response.json();
      return (data.result.value / 1e9).toFixed(4); // Convert lamports to SOL
    } else if (wallet.wallet === 'metamask' || wallet.wallet === 'trustwallet') {
      // Ethereum balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest']
      });
      return (parseInt(balance, 16) / 1e18).toFixed(4); // Convert wei to ETH
    }
  } catch (err) {
    console.error('Error fetching balance:', err);
    return null;
  }
};

// Disconnect wallet
export const disconnectWallet = () => {
  return { connected: false, address: null, wallet: null };
};

// Format wallet address
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get wallet display name
export const getWalletDisplayName = (wallet) => {
  const names = {
    phantom: '🦄 Phantom',
    metamask: '🦊 MetaMask',
    solflare: '🔥 Solflare',
    trustwallet: '🔷 Trust Wallet'
  };
  return names[wallet] || wallet;
};

