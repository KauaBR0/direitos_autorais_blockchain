// ethers-config.js
const { ethers } = require('ethers');
const AuthChainRegistryABI = require('./AuthChainRegistry.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Carteira do Criador
const creatorWallet = new ethers.Wallet(process.env.CREATOR_PRIVATE_KEY, provider);
const contractAsCreator = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  AuthChainRegistryABI,
  creatorWallet
);

// Carteira do Comprador
const userWallet = new ethers.Wallet(process.env.USER_PRIVATE_KEY, provider);
const contractAsUser = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  AuthChainRegistryABI,
  userWallet
);

console.log("Conectado ao contrato com duas personas: Criador e Usuário.");

// Exportamos ambas as instâncias
module.exports = { contractAsCreator, contractAsUser, provider, userWallet  };