// src/RegisterModal.js
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';

function RegisterModal({ isOpen, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('consumer');
  const toast = useToast();

  const handleRegister = () => {
    if (!name.trim()) {
      toast({ title: 'Nome obrigatório', status: 'error' });
      return;
    }
    if (!email.trim()) {
      toast({ title: 'Email obrigatório', status: 'error' });
      return;
    }

    const newUser = {
      name,
      email,
      role,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
    };

    onRegister(newUser);
    toast({ title: 'Usuário registrado!', status: 'success' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Registrar Novo Usuário</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Nome</FormLabel>
              <Input
                placeholder="Nome do usuário"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Email do usuário"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Perfil</FormLabel>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ color: 'black', width: '100%', padding: '8px' }}
              >
                <option value="creator">Criador</option>
                <option value="consumer">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </FormControl>

            <Button colorScheme="teal" onClick={handleRegister} w="full">
              Registrar
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default RegisterModal;