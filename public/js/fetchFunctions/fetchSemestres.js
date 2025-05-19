// Thy Kingdom Come, Thy Will Be Done, On Earth as It Is in Heaven.
import { getToken, getUserData } from './fetchAuth.js';

const API_URL = 'https://errorsquad-server.onrender.com';

function getAdminId() {
    return getUserData().id;
}

export async function getSemestres() {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/semestre`, {
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
        console.error('Erro ao buscar semestres:', error);
        throw error;
    }
}

export async function createSemestre(semestre) {
    try {
        console.log('Enviando semestre:', semestre); // Debug

        // Enviar os campos como valores simples
        const dadosSemestre = {
            nivel: parseInt(semestre.nivel),
            ano: parseInt(semestre.ano),
            nome_curso: semestre.nome_curso,
            nome_turno: semestre.nome_turno
        };

        console.log('Dados formatados:', dadosSemestre); // Debug
        console.log('Dados formatados (string):', JSON.stringify(dadosSemestre)); // Debug

        const response = await fetch(`${API_URL}/admin/${getAdminId()}/semestre`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(dadosSemestre)
        });

        const result = await response.json();
        console.log('Resposta do backend:', result); // Debug

        if (!response.ok) {
            throw new Error(result.message || `Erro na requisição: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Erro ao criar semestre:', error); // Debug
        throw error;
    }
}

export async function updateSemestre(semestre) {
    try {
        console.log('Enviando dados para atualização:', semestre); // Debug

        // Formatar os dados para corresponder ao formato esperado pelo controller
        const dadosSemestre = {
            id: parseInt(semestre.id_semestre_cronograma),
            nivel: parseInt(semestre.nivel_semestre_cronograma),
            ano: parseInt(semestre.ano_semestre_cronograma),
            nome_curso: semestre.sigla_curso,
            nome_turno: semestre.nome_turno
        };

        console.log('Dados formatados:', dadosSemestre); // Debug

        const response = await fetch(`${API_URL}/admin/${getAdminId()}/semestre`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(dadosSemestre)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
            console.error('Resposta de erro da API:', errorData); // Debug adicional
            throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

export async function deleteSemestre(id) {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/semestre`, {
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

// And Forgive Us Our Debts, As We Forgive Our Debtors.

// But Deliver Us from Evil. 