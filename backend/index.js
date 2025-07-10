// index.js (versão atualizada)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers'); // Certifique-se que ethers está no topo se ainda não estiver
const { contract } = require('./ethers-config.js'); // Importa o contrato instanciado
const { contractAsCreator, contractAsUser } = require('./ethers-config.js');


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
    const tx = await contractAsCreator.registerWork(title, ipfsHash, metadata);
    
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
    const tx = await contractAsCreator.createLicense(workId, priceInWei, duration, usageType);

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

// ROTA PARA UM USUÁRIO COMPRAR UMA LICENÇA
app.post('/api/licenses/purchase/:licenseId', async (req, res) => {
  try {
    const { licenseId } = req.params;

    console.log(`Usuário tentando comprar a licença ID: ${licenseId}`);

    // 1. Primeiro, usamos a instância de LEITURA para buscar os detalhes da licença
    // A função getLicense não precisa de um signer, então qualquer instância funciona.
    const license = await contractAsCreator.getLicense(licenseId);

    if (license.id === 0n) {
      return res.status(404).json({ message: "Licença não encontrada." });
    }
    if (license.active) {
        return res.status(400).json({ message: "Esta licença já está ativa." });
    }

    const priceInWei = license.price;
    console.log(`Preço da licença é ${ethers.formatEther(priceInWei)} ETH. Enviando transação...`);

    // 2. Usamos a instância do USUÁRIO para chamar a função de compra
    const tx = await contractAsUser.purchaseLicense(licenseId, {
      value: priceInWei // Enviamos o valor junto com a transação
    });

    // 3. Espera a transação ser minerada
    await tx.wait();

    res.status(200).json({ message: "Licença comprada com sucesso!", transactionHash: tx.hash });

  } catch (error) {
    console.error("Erro ao comprar licença:", error);
    if (error.reason) {
      return res.status(400).json({ message: "Erro de contrato: " + error.reason });
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// ROTA PARA BUSCAR TODAS AS OBRAS DE UM CRIADOR ESPECÍFICO
app.get('/api/creators/:creatorAddress/works', async (req, res) => {
    try {
        const { creatorAddress } = req.params;
        console.log(`Buscando obras para o criador: ${creatorAddress}`);

        // 1. Pega a lista de IDs das obras do criador
        const workIds = await contractAsCreator.getCreatorWorks(creatorAddress);

        if (workIds.length === 0) {
            return res.status(200).json([]); // Retorna um array vazio se não houver obras
        }

        // 2. Busca os detalhes de cada obra em paralelo
        const worksPromises = workIds.map(id => contractAsCreator.getWork(id));
        const worksData = await Promise.all(worksPromises);

        // 3. Formata os dados para enviar ao frontend
        const formattedWorks = worksData.map(work => ({
            id: work.id.toString(),
            creator: work.creator,
            title: work.title,
            ipfsHash: work.ipfsHash,
            metadata: work.metadata,
            timestamp: new Date(Number(work.timestamp) * 1000).toISOString()
        }));

        res.status(200).json(formattedWorks);

    } catch (error) {
        console.error("Erro ao buscar obras do criador:", error);
        res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
    }
});


// ROTA PARA BUSCAR TODAS AS OBRAS (MARKETPLACE)
app.get('/api/works', async (req, res) => {
    try {
        // No contrato, _workIds começa em 1 e é incrementado. 
        // Para obter o total de obras, pegamos o valor atual do contador.
        // Precisamos de uma função no contrato para ler o contador. Vamos adicioná-la.

        // **AÇÃO NECESSÁRIA NO SMART CONTRACT** // Adicione esta função ao seu AuthChainRegistry.sol e faça o deploy novamente:
        // function getWorkCount() public view returns (uint256) {
        //     return _workIds.current();
        // }

        const workCount = await contractAsCreator.getWorkCount();

        let works = [];
        // O contador começa em 1, então o loop vai de 1 até < workCount
        for (let i = 1; i < workCount; i++) {
            const work = await contractAsCreator.getWork(i);
            // Buscamos também as licenças para cada obra
            const licenses = await contractAsCreator.getWorkLicenses(i);

            if (work.id !== 0n) { // Apenas adiciona se a obra for válida
                works.push({
                    id: work.id.toString(),
                    title: work.title,
                    ipfsHash: work.ipfsHash,
                    metadata: work.metadata,
                    licenseIds: licenses.map(l => l.toString()) // Adiciona os IDs das licenças
                });
            }
        }

        res.status(200).json(works);

    } catch (error) {
        console.error("Erro ao buscar todas as obras:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});