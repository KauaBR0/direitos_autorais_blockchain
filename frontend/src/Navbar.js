// src/Navbar.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, HStack, Link as ChakraLink, Heading, Button, useDisclosure, Text } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { FiLogIn, FiLogOut } from 'react-icons/fi';

function Navbar() {
  const { currentUser, login, logout, register } = useAuth(); // ✅ adicionei register aqui
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();

  return (
    <>
      <Box as="nav" bg="gray.900" px={8} py={4} boxShadow="md">
        <HStack justifyContent="space-between">
          <Heading size="md" color="white">AuthChainRegistry</Heading>

          <HStack spacing={8}>
            <ChakraLink as={RouterLink} to="/" color="gray.300">Marketplace</ChakraLink>
            {currentUser?.role === 'creator' && (
              <ChakraLink as={RouterLink} to="/dashboard" color="gray.300">Meu Dashboard</ChakraLink>
            )}
          </HStack>

          <HStack>
            {currentUser ? (
              <>
                <Text fontSize="sm" color="gray.400">Olá, {currentUser.name}</Text>
                <Button size="sm" leftIcon={<FiLogOut />} colorScheme="red" variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" leftIcon={<FiLogIn />} colorScheme="purple" onClick={onLoginOpen}>
                  Login
                </Button>
                <Button size="sm" colorScheme="teal" onClick={onRegisterOpen}>
                  Registrar
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Box>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <RegisterModal isOpen={isRegisterOpen} onClose={onRegisterClose} onRegister={register} />
    </>
  );
}

export default Navbar;