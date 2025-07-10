// src/CreatorDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateLicenseForm from './CreateLicenseForm';

// Imports do Chakra
import {
    Box, Heading, Text, Button, Link, Spinner
} from '@chakra-ui/react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer
} from '@chakra-ui/table';

function CreatorDashboard() {
    const [works, setWorks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkId, setSelectedWorkId] = useState(null);

    const creatorAddress = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"; 

    const fetchWorks = async () => {
        if (!creatorAddress) return;
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:3001/api/creators/${creatorAddress}/works`);
            setWorks(response.data);
            setError('');
        } catch (err) {
            setError('Falha ao buscar as obras.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    const handleOpenModal = (workId) => {
        setSelectedWorkId(workId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkId(null);
        fetchWorks(); 
    };

    if (error) return <Text color="red.400">{error}</Text>;

    return (
        <Box borderWidth="1px" borderRadius="lg" p={6} w="full" maxW="800px">
            <Heading as="h2" size="lg" textAlign="center" mb={6}>
                Meu Dashboard de Obras
            </Heading>

            {isLoading ? (
                <Spinner />
            ) : works.length === 0 ? (
                <Text textAlign="center">Você ainda não registrou nenhuma obra.</Text>
            ) : (
                <TableContainer>
                    {/* AQUI ESTÁ A CORREÇÃO PRINCIPAL */}
                    <Table variant="simple" tableLayout="fixed" width="100%">
                        <Thead>
                            <Tr>
                                <Th isNumeric width="10%">ID</Th>
                                <Th width="40%">Título</Th>
                                <Th width="30%">Hash IPFS</Th>
                                <Th textAlign="center" width="20%">Ações</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {works.map(work => (
                                <Tr key={work.id}>
                                    <Td isNumeric>{work.id}</Td>
                                    <Td>{work.title}</Td>
                                    <Td>
                                        <Link href={`https://ipfs.io/ipfs/${work.ipfsHash}`} isExternal color="blue.300" isTruncated>
                                            {work.ipfsHash}
                                        </Link>
                                    </Td>
                                    <Td textAlign="center">
                                        <Button size="sm" colorScheme="teal" onClick={() => handleOpenModal(work.id)}>
                                            Criar Licença
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreateLicenseForm workId={selectedWorkId} onClose={handleCloseModal} />
                </div>
            )}
        </Box>
    );
}

export default CreatorDashboard;