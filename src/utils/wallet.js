// Wallet integration utilities

export const connectPhantom = async () => {
  if (typeof window.phantom?.solana !== 'undefined') {
    try {
      const resp = await window.phantom.solana.connect();
      return {
        address: resp.publicKey.toString(),
        wallet: 'phantom',
        connected: true
      };
    } catch (err) {
      console.error('Phantom connection error:', err);
      return { connected: false, error: err.message };
    }
  } else {
    return { connected: false, error: 'Phantom wallet not found' };
  }
};

export const connectMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return {
        address: accounts[0],
        wallet: 'metamask',
        connected: true
      };
    } catch (err) {
      console.error('MetaMask connection error:', err);
      return { connected: false, error: err.message };
    }
  } else {
    return { connected: false, error: 'MetaMask not found' };
  }
};

export const disconnectWallet = () => {
  return { connected: false, address: null, wallet: null };
};

