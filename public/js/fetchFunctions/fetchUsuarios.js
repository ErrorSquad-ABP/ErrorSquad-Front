export { getUsuarios, createUsuario, updateUsuario, deleteUsuario };

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
        const response = await fetch(`https://errorsquad-server.onrender.com/admin/${id}/user`, {
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

export async function updateNomeUsuario(id, nome) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }
    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/admin/${id}/user/alterName`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: Number(id), nome })
        });
        if (!response.ok) throw new Error(`Erro ao atualizar nome: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar nome:', error);
        throw error;
    }
}

export async function updateSenhaUsuario(id, senhaAtual, senhaNova) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }
    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/admin/${id}/user/alterPassword`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: Number(id), senhaAtual, senhaNova })
        });
        if (!response.ok) throw new Error(`Erro ao atualizar senha: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        throw error;
    }
}

export async function getUsuarioById(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }
    try {
        const response = await fetch(`https://errorsquad-server.onrender.com/admin/${id}/user/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`Erro ao buscar usuário: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
    }
} 