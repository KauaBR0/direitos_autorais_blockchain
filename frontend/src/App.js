// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, VStack } from '@chakra-ui/react';
import Navbar from './Navbar';
import Marketplace from './Marketplace';
import CreatorDashboard from './CreatorDashboard';
import RegisterWorkForm from './RegisterWorkForm';
import './App.css';

// Não precisa mais dessas funções separadas aqui
// function HomePage() { ... }
// function DashboardPage() { ... }

function App() {
  return (
    <Router>
      {/* O Navbar agora controla o modal de login */}
      <Navbar /> 
      
      <Box className="App" bg="gray.800" color="white" minH="100vh">
        <Container maxW="container.xl" pt={8} pb={8}>
            <Routes>
                <Route path="/" element={<Marketplace />} />
                <Route path="/dashboard" element={
                    <VStack spacing={10} align="center"> 
                        <RegisterWorkForm />
                        <CreatorDashboard />
                    </VStack>
                } />
            </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;