async function getUsuarios() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/usuarios', {
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
            throw new Error(`Erro ao buscar usuários: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
    }
}

async function createUsuario(usuarioData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch('https://errorsquad-server.onrender.com/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao criar usuário: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
    }
}

async function updateUsuario(id, usuarioData) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return;
            }
            throw new Error(`Erro ao atualizar usuário: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
    }
}

async function deleteUsuario(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/usuarios/${id}`, {
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
            throw new Error(`Erro ao deletar usuário: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        throw error;
    }
} 