async function getTurmas() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/turmas', {
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
            throw new Error(`Erro ao buscar turmas: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        throw error;
    }
}

async function createTurma(turmaData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/turmas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(turmaData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao criar turma: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao criar turma:', error);
        throw error;
    }
}

async function updateTurma(id, turmaData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/turmas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(turmaData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao atualizar turma: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        throw error;
    }
}

async function deleteTurma(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/turmas/${id}`, {
            method: 'DELETE',
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
            throw new Error(`Erro ao deletar turma: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao deletar turma:', error);
        throw error;
    }
} 