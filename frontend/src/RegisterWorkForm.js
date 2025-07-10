"use client"
import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Button, Input, VStack, Heading,
} from '@chakra-ui/react';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { FormControl, FormLabel } from '@chakra-ui/form-control';


function RegisterWorkForm() {
    const [title, setTitle] = useState('');
    const [metadata, setMetadata] = useState('');
    const [file, setFile] = useState(null); // Estado para guardar o arquivo
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        if (!file) {
            setStatusMessage("Por favor, selecione um arquivo para a obra.");
            setIsError(true); // <<-- ADICIONE
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setStatusMessage('Fazendo upload do arquivo para o IPFS...');

        try {
            // Passo 1: Fazer o upload do arquivo para o Pinata (IPFS)
            const formData = new FormData();
            formData.append("file", file);

            const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY
                }
            });

            const ipfsHash = pinataResponse.data.IpfsHash;
            setStatusMessage(`Arquivo enviado para o IPFS com sucesso! Hash: ${ipfsHash}. Registrando no blockchain...`);

            // Passo 2: Registrar a obra no blockchain com o hash real do IPFS
            const backendResponse = await axios.post('http://localhost:3001/api/works', {
                title,
                ipfsHash, // Usando o hash real retornado pelo Pinata
                metadata
            });

            setIsLoading(false);

            setStatusMessage(`Sucesso! Obra registrada. Hash da transação: ${backendResponse.data.transactionHash}`);
            setTitle('');
            setMetadata('');
            setFile(null);

        } catch (error) {

            setIsLoading(false);
            setIsError(true);
            const errorMessage = error.response?.data?.message || error.message;
            setStatusMessage(`Erro: ${errorMessage}`);
        }
    };

    return (
        <Box borderWidth="1px" borderRadius="lg" p={6} my={4} w="full" maxW="500px">
            <VStack spacing={4} as="form" onSubmit={handleRegister}>
                <Heading size="md">Registrar Nova Obra</Heading>
                <FormControl isRequired>
                    <FormLabel>Título da Obra</FormLabel>
                    <Input placeholder="Ex: Minha Sinfonia" value={title} onChange={(e) => setTitle(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Metadados</FormLabel>
                    <Input placeholder="Ex: tipo: audio, genero: classico" value={metadata} onChange={(e) => setMetadata(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Arquivo da Obra</FormLabel>
                    <Input type="file" p={1} onChange={(e) => setFile(e.target.files[0])} />
                </FormControl>
                <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                    Registrar Obra
                </Button>
                {statusMessage && (
                    <Alert status={isError ? 'error' : 'success'} mt={4}>
                        <AlertIcon />
                        {statusMessage}
                    </Alert>
                )}
            </VStack>
        </Box>
    );
}
export default RegisterWorkForm;