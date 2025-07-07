// ethers-config.js
const { ethers } = require('ethers');
const AuthChainRegistryABI = require('./AuthChainRegistry.json').abi; // Importe o ABI

// 1. Configurar o Provedor (conexão com o nó blockchain)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// 2. Configurar a Carteira (signer) que fará as transações
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3. Instanciar o Contrato
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    AuthChainRegistryABI,
    wallet // Conecta o contrato ao signer para poder enviar transações
);

console.log("Conectado ao contrato no endereço:", process.env.CONTRACT_ADDRESS);

module.exports = { contract, provider };