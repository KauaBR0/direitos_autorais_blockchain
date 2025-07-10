// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, Heading, VStack } from '@chakra-ui/react';
import Navbar from './Navbar';
import Marketplace from './Marketplace';
import CreatorDashboard from './CreatorDashboard';
import RegisterWorkForm from './RegisterWorkForm';
import './App.css';

function HomePage() {
    return (
        // A propriedade 'align' foi alterada aqui
        <VStack spacing={8} align="center"> 
            <Box>
                <Heading as="h2" size="xl" mb={6} textAlign="center">Marketplace de Obras</Heading>
                <Marketplace />
            </Box>
        </VStack>
    );
}

function DashboardPage() {
    return (
        // E a propriedade 'align' foi alterada aqui também
        <VStack spacing={10} align="center"> 
            <RegisterWorkForm />
            <CreatorDashboard />
        </VStack>
    );
}

function App() {
  return (
    <Router>
      <Box className="App" bg="gray.800" color="white" minH="100vh">
        <Navbar />
        <Container maxW="container.xl" pt={8} pb={8}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;