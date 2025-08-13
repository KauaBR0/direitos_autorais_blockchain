import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Button, Input, VStack, Heading, HStack, Select, useToast, FormControl, FormLabel
} from '@chakra-ui/react';



function CreateLicenseForm({ workId, onClose }) {
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [usageType, setUsageType] = useState('commercial');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const durationInSeconds = parseInt(duration) * 86400;

            const response = await axios.post('http://localhost:3001/api/licenses', {
                workId: workId,
                price: price,
                duration: durationInSeconds,
                usageType: usageType
            });
            
            toast({
                title: 'Licença Criada com Sucesso!',
                description: `Hash: ${response.data.transactionHash.substring(0, 20)}...`,
                status: 'success',
                duration: 9000,
                isClosable: true,
            });

            setTimeout(onClose, 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast({
                title: 'Erro ao Criar Licença.',
                description: errorMessage,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Usando o Box do Chakra para o container do formulário
        <Box bg="gray.700" color="white" p={6} borderRadius="lg" w="full" maxW="400px">
            <VStack as="form" onSubmit={handleSubmit} spacing={4}>
                <Heading size="md">Criar Licença para Obra ID: {workId}</Heading>
                
                <FormControl isRequired>
                    <FormLabel>Preço (em ETH):</FormLabel>
                    <Input 
                        placeholder="Ex: 0.1"
                        type="number" 
                        step="0.001"
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Duração (em dias):</FormLabel>
                    <Input 
                        placeholder="Ex: 365"
                        type="number" 
                        value={duration} 
                        onChange={e => setDuration(e.target.value)} 
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Tipo de Uso:</FormLabel>
                    <Select value={usageType} onChange={e => setUsageType(e.target.value)}>
                        <option style={{ color: 'black' }} value="commercial">Comercial</option>
                        <option style={{ color: 'black' }} value="non-commercial">Não Comercial</option>
                    </Select>
                </FormControl>
                
                <HStack w="full" justify="flex-end" mt={4}>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" colorScheme="teal" isLoading={isLoading}>
                        Confirmar Licença
                    </Button>
                </HStack>

            </VStack>
        </Box>
    );
}

export default CreateLicenseForm;