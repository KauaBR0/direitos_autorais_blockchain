// src/CreateLicenseForm.js
import React, { useState } from 'react';
import axios from 'axios';

// Este componente recebe o ID da obra e uma função para fechar o modal
function CreateLicenseForm({ workId, onClose }) {
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [usageType, setUsageType] = useState('commercial');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage('Criando licença, por favor aguarde...');

        try {
            // A duração em dias será convertida para segundos
            const durationInSeconds = parseInt(duration) * 86400;

            const response = await axios.post('http://localhost:3001/api/licenses', {
                workId: workId,
                price: price,
                duration: durationInSeconds,
                usageType: usageType
            });

            setStatusMessage(`Licença criada com sucesso! Hash: ${response.data.transactionHash}`);
            setTimeout(onClose, 2000); // Fecha o modal após 2 segundos

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setStatusMessage(`Erro: ${errorMessage}`);
        }
    };

    return (
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px', zIndex: 100 }}>
            <h3>Criar Licença para Obra ID: {workId}</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Preço (em ETH):</label><br />
                    <input type="text" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Duração (em dias):</label><br />
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Tipo de Uso:</label><br />
                    <select value={usageType} onChange={e => setUsageType(e.target.value)}>
                        <option value="commercial">Comercial</option>
                        <option value="non-commercial">Não Comercial</option>
                    </select>
                </div>
                <button type="submit">Confirmar Licença</button>
                <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancelar</button>
            </form>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}

export default CreateLicenseForm;