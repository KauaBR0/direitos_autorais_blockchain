// ignition/modules/deploy.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AuthChainRegistryModule", (m) => {
  // O construtor do seu contrato não tem argumentos, então o segundo parâmetro é um array vazio.
  const authChain = m.contract("AuthChainRegistry", []);

  // O Hardhat Ignition lida com o console.log e o processo de deploy automaticamente.
  // Você não precisa do 'main()' nem do 'process.exit()'.
  
  return { authChain };
});