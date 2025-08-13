// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from './AuthContext'; // <<<--- IMPORTE AQUI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* // <<<--- ENVOLVA A APLICAÇÃO */}
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </AuthProvider> {/* // <<<--- FIM DO "ABRAÇO" */}
  </React.StrictMode>
);