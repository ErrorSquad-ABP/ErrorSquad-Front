async function getAulas() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/aulas', {
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
            throw new Error(`Erro ao buscar aulas: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        throw error;
    }
}

async function createAula(aulaData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/aulas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(aulaData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao criar aula: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        throw error;
    }
}

async function updateAula(id, aulaData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/aulas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(aulaData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao atualizar aula: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        throw error;
    }
}

async function deleteAula(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/aulas/${id}`, {
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
            throw new Error(`Erro ao deletar aula: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao deletar aula:', error);
        throw error;
    }
} 