export const CONTRACT_ADDRESS = "0xDD5668eB939B13812563d699101FcA73b7d8B094" // Deployed on Sepolia

// Contract ABI for PrivacyNBABetting
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "homeTeam", "type": "string" },
      { "internalType": "string", "name": "awayTeam", "type": "string" },
      { "internalType": "string", "name": "gameDate", "type": "string" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "overUnderLine", "type": "uint256" }
    ],
    "name": "createMatch",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "matchId", "type": "uint256" },
      { "internalType": "uint8", "name": "plainChoice", "type": "uint8" }
    ],
    "name": "placeBetMock",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
    "name": "closeMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "matchId", "type": "uint256" },
      { "internalType": "uint32", "name": "resultPlain", "type": "uint32" }
    ],
    "name": "settleMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "matchCounter",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
    "name": "getMatchInfo",
    "outputs": [
      { "internalType": "string", "name": "homeTeam", "type": "string" },
      { "internalType": "string", "name": "awayTeam", "type": "string" },
      { "internalType": "string", "name": "gameDate", "type": "string" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint8", "name": "state", "type": "uint8" },
      { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
      { "internalType": "uint256", "name": "poolByOutcome0", "type": "uint256" },
      { "internalType": "uint256", "name": "poolByOutcome1", "type": "uint256" },
      { "internalType": "uint256", "name": "poolByOutcome2", "type": "uint256" },
      { "internalType": "uint256", "name": "overUnderLine", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ],
    "name": "getUserMatches",
    "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ],
    "stateMutability": "view",
    "type": "function"
  }
]
