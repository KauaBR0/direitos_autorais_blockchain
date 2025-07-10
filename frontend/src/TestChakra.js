// src/TestChakra.js
import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

function TestChakra() {
  return (
    <Box bg="tomato" w="100%" p={4} color="white" mt={10}>
      <Heading>Se você está vendo esta caixa, a biblioteca Chakra UI está funcionando.</Heading>
    </Box>
  );
}

export default TestChakra;