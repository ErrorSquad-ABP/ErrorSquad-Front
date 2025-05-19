import { getToken, getUserData } from './fetchAuth.js';

const API_URL = 'https://errorsquad-server.onrender.com';

function getAdminId() {
    return getUserData().id;
}

export async function getDocentes() {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/docente`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Token inválido');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar docentes:', error);
        throw error;
    }
}

export async function createDocente(docente) {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/docente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                nome: docente.nome,
                cor: docente.cor
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function updateDocente(docente) {
    try {
        const adminId = getAdminId();
        const endpoint = `${API_URL}/admin/${adminId}/docente`;
        const token = getToken();
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: docente.id,
                nome: docente.nome,
                cor: docente.cor
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function deleteDocente(id) {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/docente`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ id })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
} 
