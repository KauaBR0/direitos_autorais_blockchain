// src/LoginModal.js (v2)
import React from 'react';
import { useAuth } from './AuthContext';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Heading,
  Text,
  Box,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FiUser, FiUsers, FiShield } from 'react-icons/fi';

function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();

  const handleLogin = (role) => {
    login(role);
    onClose();
  };

  const roles = [
    { id: 'creator', title: 'Criador', description: 'Crie e gerencie', icon: FiUser },
    { id: 'consumer', title: 'Usuário', description: 'Explore conteúdo', icon: FiUsers },
    { id: 'admin', title: 'Admin', description: 'Gerencie a plataforma', icon: FiShield },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" color="white" borderRadius="xl" boxShadow="xl">
        <ModalHeader>
          <VStack spacing={2}>
            <Heading size="lg">Bem-vindo!</Heading>
            <Text fontSize="sm" color="gray.400">Selecione seu perfil para continuar</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {roles.map((role) => (
              <Box
                key={role.id}
                w="full"
                p={4}
                bg="gray.700"
                borderRadius="lg"
                cursor="pointer"
                _hover={{ bg: 'gray.600' }}
                onClick={() => handleLogin(role.id)}
              >
                <HStack spacing={4}>
                  <Icon as={role.icon} boxSize={6} color="white" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{role.title}</Text>
                    <Text fontSize="sm" color="gray.400">{role.description}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default LoginModal;