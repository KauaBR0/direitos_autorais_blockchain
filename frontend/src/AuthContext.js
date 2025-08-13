// src/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Mock de usuários para a simulação
const MOCK_USERS = {
    creator: {
        name: "Criador de Conteúdo",
        role: "creator",
        address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
    },
    consumer: {
        name: "Usuário de Conteúdo",
        role: "consumer",
        address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
    },
    admin: {
        name: "Admin da Plataforma",
        role: "admin",
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const login = (role) => {
        // --- ADICIONADO PARA DEBUG ---
        console.log("Tentando fazer login como:", role);

        if (MOCK_USERS[role]) {
            setCurrentUser(MOCK_USERS[role]);

            // --- ADICIONADO PARA DEBUG ---
            console.log("Usuário definido com sucesso:", MOCK_USERS[role]);
        } else {
            console.error("Perfil (role) não encontrado:", role);
        }
    };

    const register = (user) => {
        // Mock: salva no estado
        const newUser = {
            ...user,
            id: Date.now().toString(),
        };
        MOCK_USERS[newUser.id] = newUser;
        setCurrentUser(newUser);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const value = { currentUser, login, logout, register };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}