// src/Navbar.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, HStack, Link as ChakraLink, Heading } from '@chakra-ui/react';

function Navbar() {
    return (
        <Box as="nav" bg="gray.900" px={8} py={4}>
            <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color="white">AuthChainRegistry</Heading>
                <HStack spacing={8}>
                    <ChakraLink as={RouterLink} to="/" color="white" _hover={{ color: 'blue.300' }}>
                        Marketplace
                    </ChakraLink>
                    <ChakraLink as={RouterLink} to="/dashboard" color="white" _hover={{ color: 'blue.300' }}>
                        Meu Dashboard
                    </ChakraLink>
                </HStack>
            </HStack>
        </Box>
    );
}
export default Navbar;