const API_URL = 'https://errorsquad-server.onrender.com';

function getAdminId() {
    return localStorage.getItem('userId');
}

export async function getDisciplinas() {
    const token = localStorage.getItem('token');
    const id = getAdminId();
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        console.log('Buscando disciplinas para admin:', id);
        const response = await fetch(`${API_URL}/admin/${id}/disciplina`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao buscar disciplinas: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resposta completa da API:', result);
        console.log('Dados das disciplinas:', result.data);
        return result;
    } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        throw error;
    }
}

export async function createDisciplina(disciplinaData) {
    const token = localStorage.getItem('token');
    const id = getAdminId();
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/${id}/disciplina`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(disciplinaData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            const errorBody = await response.text();
            console.error('Corpo da resposta de erro:', errorBody);
            throw new Error(`Erro ao criar disciplina: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resposta da API:', result);
        return result;
    } catch (error) {
        console.error('Erro ao criar disciplina:', error);
        throw error;
    }
}

export async function updateDisciplina(idDisciplina, disciplinaData) {
    const token = localStorage.getItem('token');
    const id = getAdminId();
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/${id}/disciplina`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: idDisciplina, ...disciplinaData })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao atualizar disciplina: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resposta da API:', result);
        return result;
    } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
        throw error;
    }
}

export async function deleteDisciplina(idDisciplina) {
    const token = localStorage.getItem('token');
    const id = getAdminId();
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/${id}/disciplina`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: idDisciplina })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao deletar disciplina: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao deletar disciplina:', error);
        throw error;
    }
} 