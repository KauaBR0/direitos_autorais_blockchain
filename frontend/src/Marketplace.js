// src/Marketplace.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Box, Button, Heading, Text, Spinner, Link,
    SimpleGrid, Center, VStack, HStack, Badge,
    Container, IconButton, Input,
    Flex, useDisclosure, AspectRatio, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Card, CardBody, CardFooter, Tag, useToast
} from '@chakra-ui/react';
import { 
    FiSearch, FiExternalLink, FiShoppingCart, FiEye, 
    FiGrid, FiList, FiHeart
} from 'react-icons/fi';

function Marketplace() {
    const [works, setWorks] = useState([]);
    const [filteredWorks, setFilteredWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedWork, setSelectedWork] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const fetchWorks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/works');
            setWorks(response.data);
            setFilteredWorks(response.data);
        } catch (err) {
            toast({
                title: "Erro ao carregar o Marketplace.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchWorks();
    }, [fetchWorks]);

    // Filtro de pesquisa
    useEffect(() => {
        const filtered = works.filter(work =>
            work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            work.metadata.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredWorks(filtered);
    }, [searchTerm, works]);

    const handlePurchase = async (licenseId) => {
        if (isPurchasing) return;
        setIsPurchasing(licenseId);

        try {
            const response = await axios.post(`http://localhost:3001/api/licenses/purchase/${licenseId}`);
            toast({
                title: "🎉 Compra realizada com sucesso!",
                description: `Licença adquirida! A interface será atualizada em breve.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setTimeout(fetchWorks, 1000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast({
                title: "❌ Erro na compra",
                description: errorMessage,
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsPurchasing(null);
        }
    };

    const handleViewDetails = (work) => {
        setSelectedWork(work);
        onOpen();
    };

    const getRandomGradient = () => {
        const gradients = [
            'linear(to-r, purple.400, pink.400)',
            'linear(to-r, blue.400, cyan.400)',
            'linear(to-r, green.400, teal.400)',
            'linear(to-r, orange.400, red.400)',
            'linear(to-r, yellow.400, orange.400)',
            'linear(to-r, indigo.400, purple.400)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    };

    if (isLoading) {
        return (
            <Center minH="60vh">
                <VStack spacing={4}>
                    <Spinner size="xl" color="purple.500" thickness="4px" />
                    <Text color="gray.400">Carregando marketplace...</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Container maxW="7xl" py={8}>
            {/* Header */}
            <VStack spacing={6} mb={8}>
                <Box textAlign="center">
                    <Heading 
                        size="2xl" 
                        bgGradient="linear(to-r, purple.400, pink.400)"
                        bgClip="text"
                        mb={2}
                    >
                        🎨 Marketplace
                    </Heading>
                    <Text color="gray.400" fontSize="lg">
                        Descubra e adquira obras digitais exclusivas
                    </Text>
                </Box>

                {/* Controles */}
                <Flex 
                    w="full" 
                    direction={{ base: 'column', md: 'row' }} 
                    gap={4}
                    align="center"
                    justify="space-between"
                >
                    <Box position="relative" maxW="400px">
                        <Input
                            placeholder="Pesquisar obras..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bg="gray.800"
                            border="1px"
                            borderColor="gray.600"
                            _hover={{ borderColor: 'purple.400' }}
                            _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px purple.400' }}
                            pl={10}
                        />
                        <Box
                            position="absolute"
                            left={3}
                            top="50%"
                            transform="translateY(-50%)"
                            color="gray.400"
                        >
                            <FiSearch />
                        </Box>
                    </Box>

                    <HStack spacing={2}>
                        <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                            {filteredWorks.length} obras encontradas
                        </Badge>
                        {/* <IconButton
                            icon={<FiGrid />}
                            aria-label="Visualização em grade"
                            size="sm"
                            variant={viewMode === 'grid' ? 'solid' : 'outline'}
                            colorScheme="purple"
                            onClick={() => setViewMode('grid')}
                        />
                        <IconButton
                            icon={<FiList />}
                            aria-label="Visualização em lista"
                            size="sm"
                            variant={viewMode === 'list' ? 'solid' : 'outline'}
                            colorScheme="purple"
                            onClick={() => setViewMode('list')}
                        /> */}
                    </HStack>
                </Flex>
            </VStack>

            {/* Grid de Obras */}
            {filteredWorks.length === 0 ? (
                <Center py={20}>
                    <VStack spacing={4}>
                        <Text fontSize="6xl">🔍</Text>
                        <Heading size="lg" color="gray.400">
                            Nenhuma obra encontrada
                        </Heading>
                        <Text color="gray.500">
                            Tente ajustar sua pesquisa ou aguarde novas obras serem adicionadas
                        </Text>
                    </VStack>
                </Center>
            ) : (
                <SimpleGrid 
                    columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} 
                    spacing={6}
                    w="full"
                >
                    {filteredWorks.map(work => (
                        <Card 
                            key={work.id} 
                            bg="gray.800"
                            borderWidth="1px"
                            borderColor="gray.700"
                            borderRadius="xl"
                            overflow="hidden"
                            transition="all 0.3s"
                            _hover={{
                                transform: 'translateY(-8px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                borderColor: 'purple.400'
                            }}
                        >
                            {/* Imagem/Preview */}
                            <Box position="relative">
                                <AspectRatio ratio={16/9}>
                                    <Box
                                        bg={getRandomGradient()}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        position="relative"
                                    >
                                        <Text fontSize="4xl" opacity={1}>🎨</Text>
                                        {/* <IconButton
                                            icon={<FiEye />}
                                            aria-label="Ver detalhes"
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            size="sm"
                                            colorScheme="whiteAlpha"
                                            onClick={() => handleViewDetails(work)}
                                        /> */}
                                    </Box>
                                </AspectRatio>
                            </Box>

                            <CardBody p={6}>
                                <VStack align="start" spacing={3}>
                                    <HStack justify="space-between" w="full">
                                        <Heading size="md" noOfLines={1}>
                                            {work.title}
                                        </Heading>
                                        <IconButton
                                            icon={<FiHeart />}
                                            aria-label="Favoritar"
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="pink"
                                        />
                                    </HStack>
                                    
                                    <Badge colorScheme="gray" fontSize="xs">
                                        ID: {work.id}
                                    </Badge>
                                    
                                    <Text 
                                        color="gray.400" 
                                        fontSize="sm"
                                        noOfLines={2}
                                        minH="40px"
                                    >
                                        {work.metadata}
                                    </Text>
                                    
                                    <HStack spacing={2} w="full">
                                        <Link 
                                            href={`https://ipfs.io/ipfs/${work.ipfsHash}`} 
                                            isExternal 
                                            color="blue.300"
                                            fontSize="sm"
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                            _hover={{ color: 'blue.200' }}
                                        >
                                            <FiExternalLink size="12px" />
                                            IPFS
                                        </Link>
                                        <Badge colorScheme="green" size="sm">
                                            Verificado
                                        </Badge>
                                    </HStack>
                                </VStack>
                            </CardBody>

                            <CardFooter p={6} pt={0}>
                                {work.licenseIds.length > 0 ? (
                                    <Button
                                        leftIcon={<FiShoppingCart />}
                                        colorScheme="purple"
                                        size="md"
                                        w="full"
                                        onClick={() => handlePurchase(work.licenseIds[0])}
                                        isLoading={isPurchasing === work.licenseIds[0]}
                                        isDisabled={isPurchasing !== null}
                                        loadingText="Processando..."
                                        bg="purple.600"
                                        _hover={{ bg: 'purple.500' }}
                                    >
                                        Comprar Licença
                                    </Button>
                                ) : (
                                    <Tag 
                                        colorScheme="red" 
                                        size="lg" 
                                        w="full" 
                                        justifyContent="center"
                                        py={2}
                                    >
                                        Licença Indisponível
                                    </Tag>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Modal de Detalhes */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent bg="gray.800" borderRadius="xl">
                    <ModalHeader>
                        <HStack>
                            <Text fontSize="2xl">🎨</Text>
                            <Heading size="lg">
                                {selectedWork?.title}
                            </Heading>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedWork && (
                            <VStack align="start" spacing={6}>
                                <Box w="full">
                                    <AspectRatio ratio={16/9}>
                                        <Box
                                            bg={getRandomGradient()}
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Text fontSize="6xl" opacity={0.3}>🎨</Text>
                                        </Box>
                                    </AspectRatio>
                                </Box>
                                
                                <VStack align="start" spacing={4} w="full">
                                    <Box>
                                        <Text fontWeight="bold" color="gray.300" mb={1}>
                                            Descrição
                                        </Text>
                                        <Text color="gray.400">
                                            {selectedWork.metadata}
                                        </Text>
                                    </Box>

                                    <Box h="1px" bg="gray.600" w="full" my={2} />

                                    <HStack justify="space-between" w="full">
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold" color="gray.300">
                                                ID da Obra
                                            </Text>
                                            <Badge colorScheme="gray">
                                                {selectedWork.id}
                                            </Badge>
                                        </VStack>
                                        <VStack align="end" spacing={1}>
                                            <Text fontWeight="bold" color="gray.300">
                                                Status
                                            </Text>
                                            <Badge colorScheme="green">
                                                Verificado
                                            </Badge>
                                        </VStack>
                                    </HStack>

                                    <HStack spacing={4} w="full">
                                        <Button
                                            leftIcon={<FiExternalLink />}
                                            as={Link}
                                            href={`https://ipfs.io/ipfs/${selectedWork.ipfsHash}`}
                                            isExternal
                                            colorScheme="blue"
                                            variant="outline"
                                            flex={1}
                                        >
                                            Ver no IPFS
                                        </Button>
                                        {selectedWork.licenseIds.length > 0 && (
                                            <Button
                                                leftIcon={<FiShoppingCart />}
                                                colorScheme="purple"
                                                onClick={() => {
                                                    handlePurchase(selectedWork.licenseIds[0]);
                                                    onClose();
                                                }}
                                                isLoading={isPurchasing === selectedWork.licenseIds[0]}
                                                isDisabled={isPurchasing !== null}
                                                flex={1}
                                            >
                                                Comprar Licença
                                            </Button>
                                        )}
                                    </HStack>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default Marketplace;