import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_ADDRESS = '0x641E573A3dAc85E0c55B5Bc59879445311B084bB';

export const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'payAgent',
    inputs: [
      { name: 'agent', type: 'address', internalType: 'address' },
      { name: 'jobId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'AgentPaid',
    inputs: [
      { name: 'agent', type: 'address', indexed: true, internalType: 'address' },
      { name: 'payer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'jobId', type: 'bytes32', indexed: false, internalType: 'bytes32' },
    ],
    anonymous: false,
  },
];

// Get contract instance
export const getContract = (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

// Pay agent function
export const payAgent = async (wallet, agentAddress, jobId, amountInEth) => {
  try {
    if (!wallet || !wallet.connected) {
      return { success: false, error: 'Wallet not connected' };
    }

    // Check if it's an Ethereum wallet
    if (wallet.chain !== 'ethereum') {
      return { success: false, error: 'Please use an Ethereum wallet (MetaMask or Trust Wallet)' };
    }

    // Use window.ethereum as provider
    if (!window.ethereum) {
      return { success: false, error: 'Ethereum provider not found' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    // Convert amount to Wei
    const amountInWei = ethers.parseEther(amountInEth.toString());

    // Convert jobId to bytes32 if it's a string
    let jobIdBytes32;
    if (typeof jobId === 'string') {
      // Pad or truncate to 32 bytes
      if (jobId.length <= 32) {
        jobIdBytes32 = ethers.encodeBytes32String(jobId);
      } else {
        jobIdBytes32 = jobId; // Assume it's already bytes32
      }
    } else {
      jobIdBytes32 = jobId;
    }

    // Call payAgent function
    const tx = await contract.payAgent(agentAddress, jobIdBytes32, {
      value: amountInWei,
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      receipt,
    };
  } catch (error) {
    console.error('Error paying agent:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed',
    };
  }
};

// Listen to AgentPaid events
export const listenToAgentPaidEvents = (wallet, callback) => {
  try {
    if (!wallet || !wallet.connected) {
      console.error('Wallet not connected');
      return null;
    }

    if (wallet.chain !== 'ethereum') {
      console.error('Not an Ethereum wallet');
      return null;
    }

    if (!window.ethereum) {
      console.error('Ethereum provider not found');
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    // Listen to AgentPaid events
    contract.on('AgentPaid', (agent, payer, amount, jobId, event) => {
      callback({
        agent,
        payer,
        amount: ethers.formatEther(amount),
        jobId: ethers.decodeBytes32String(jobId),
        transactionHash: event.log.transactionHash,
      });
    });

    // Return cleanup function
    return () => {
      contract.removeAllListeners('AgentPaid');
    };
  } catch (error) {
    console.error('Error setting up event listener:', error);
    return null;
  }
};

// Get transaction history (requires ethers provider with archive node access)
export const getAgentPaidHistory = async (wallet, filterOptions = {}) => {
  try {
    if (!wallet || !wallet.connected) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (wallet.chain !== 'ethereum') {
      return { success: false, error: 'Not an Ethereum wallet' };
    }

    if (!window.ethereum) {
      return { success: false, error: 'Ethereum provider not found' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    // Create filter
    const filter = contract.filters.AgentPaid(
      filterOptions.agent || null,
      filterOptions.payer || null
    );

    // Query events
    const events = await contract.queryFilter(filter, filterOptions.fromBlock || -10000);

    const history = events.map((event) => ({
      agent: event.args.agent,
      payer: event.args.payer,
      amount: ethers.formatEther(event.args.amount),
      jobId: ethers.decodeBytes32String(event.args.jobId),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }));

    return { success: true, history };
  } catch (error) {
    console.error('Error fetching history:', error);
    return { success: false, error: error.message };
  }
};
