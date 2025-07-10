// src/Marketplace.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Importando os componentes de layout e card do Chakra UI
import {
    Box, Button, Heading, Text, Spinner, Link,
    SimpleGrid, Center
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { Card, CardBody, CardFooter } from '@chakra-ui/card';
import { Tag } from '@chakra-ui/tag';

function Marketplace() {
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/works');
                setWorks(response.data);
            } catch (err) {
                toast({
                    title: "Erro ao carregar o Marketplace.",
                    description: "Não foi possível buscar as obras.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorks();
    }, [toast]);

    const handlePurchase = async (licenseId) => {
        if (!licenseId) {
            toast({ title: "Licença indisponível.", status: "warning", duration: 3000 });
            return;
        }
        
        setIsPurchasing(licenseId);

        try {
            const response = await axios.post(`http://localhost:3001/api/licenses/purchase/${licenseId}`);
            toast({
                title: "Compra realizada com sucesso!",
                description: `Hash: ${response.data.transactionHash.substring(0, 20)}...`,
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast({
                title: "Erro na compra.",
                description: errorMessage,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsPurchasing(null);
        }
    };

    // Usando o componente <Center> para centralizar o Spinner e a mensagem de "sem obras"
    if (isLoading) {
        return <Center p={10}><Spinner size="xl" /></Center>;
    }

    return (
        <Box w="full">
            {works.length === 0 ? (
                <Center p={10}><Text>Nenhuma obra disponível no marketplace.</Text></Center>
            ) : (
                // AQUI ESTÁ A CORREÇÃO PRINCIPAL
                <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={10}>
                    {works.map(work => (
                        <Card key={work.id} borderWidth="1px" borderRadius="lg" variant="outline" maxW="sm">
                            <CardBody>
                                <Heading size="md" mb={2}>{work.title}</Heading>
                                <Text fontSize="sm" color="gray.400" mb={2}>Obra ID: {work.id}</Text>
                                <Text mb={4}>{work.metadata}</Text>
                                <Link href={`https://ipfs.io/ipfs/${work.ipfsHash}`} isExternal color="blue.300">
                                    Ver no IPFS
                                </Link>
                            </CardBody>
                            <CardFooter>
                                {work.licenseIds.length > 0 ? (
                                    <Button
                                        colorScheme="green"
                                        onClick={() => handlePurchase(work.licenseIds[0])}
                                        isLoading={isPurchasing === work.licenseIds[0]}
                                        loadingText="Comprando..."
                                    >
                                        Comprar Licença
                                    </Button>
                                ) : (
                                    <Tag colorScheme="orange">Sem licença</Tag>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}

export default Marketplace;