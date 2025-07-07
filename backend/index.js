// index.js (versão atualizada)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers'); // Certifique-se que ethers está no topo se ainda não estiver
const { contract } = require('./ethers-config.js'); // Importa o contrato instanciado

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ROTA PARA BUSCAR UMA OBRA
app.get('/api/works/:id', async (req, res) => {
  try {
    const workId = req.params.id;
    console.log(`Buscando obra com ID: ${workId}`);

    const work = await contract.getWork(workId);

    // O contrato retorna um erro se a obra não existe, mas podemos adicionar uma checagem
    if (work.id === 0n) { // Em bigint, 0 é 0n
         return res.status(404).json({ message: "Obra não encontrada." });
    }

    // Converte os dados para um formato JSON amigável
    const formattedWork = {
        id: work.id.toString(),
        creator: work.creator,
        title: work.title,
        ipfsHash: work.ipfsHash,
        metadata: work.metadata,
        timestamp: new Date(Number(work.timestamp) * 1000).toISOString()
    };

    res.status(200).json(formattedWork);
  } catch (error) {
    console.error("Erro ao buscar obra:", error);
    res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
  }
});

// ROTA PARA REGISTRAR UMA NOVA OBRA
app.post('/api/works', async (req, res) => {
  try {
    // 1. Pega os dados enviados no corpo da requisição
    const { title, ipfsHash, metadata } = req.body;

    // Validação simples para garantir que os dados necessários foram enviados
    if (!title || !ipfsHash || !metadata) {
      return res.status(400).json({ message: "Dados incompletos. Título, ipfsHash e metadata são obrigatórios." });
    }

    console.log(`Registrando nova obra: "${title}"`);

    // 2. Chama a função do contrato para registrar a obra
    const tx = await contract.registerWork(title, ipfsHash, metadata);
    
    // 3. Espera a transação ser minerada e confirmada no blockchain
    await tx.wait();

    // 4. Envia uma resposta de sucesso
    res.status(201).json({ message: "Obra registrada com sucesso!", transactionHash: tx.hash });

  } catch (error) {
    console.error("Erro ao registrar obra:", error);
    res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
  }
});

// ROTA PARA CRIAR UMA NOVA LICENÇA PARA UMA OBRA
app.post('/api/licenses', async (req, res) => {
  try {
    // 1. Pega os dados enviados no corpo da requisição
    const { workId, price, duration, usageType } = req.body;

    // Validação dos dados de entrada
    if (workId === undefined || !price || !duration || !usageType) {
      return res.status(400).json({ message: "Dados incompletos. workId, price, duration e usageType são obrigatórios." });
    }

    console.log(`Criando licença para a obra ID ${workId} com preço de ${price} ETH.`);

    // 2. Converte o preço de Ether para Wei
    const priceInWei = ethers.parseEther(price.toString());

    // 3. Chama a função do contrato para criar a licença
    // Assumindo que o 'signer' configurado no ethers-config.js é o criador da obra para este teste
    const tx = await contract.createLicense(workId, priceInWei, duration, usageType);

    // 4. Espera a transação ser minerada
    await tx.wait();

    // 5. Envia uma resposta de sucesso
    res.status(201).json({ message: "Licença criada com sucesso!", transactionHash: tx.hash });

  } catch (error) {
    console.error("Erro ao criar licença:", error);
    // Verifica se o erro é do 'require' do contrato
    if (error.reason) {
      return res.status(403).json({ message: "Erro de contrato: " + error.reason });
    }
    res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});