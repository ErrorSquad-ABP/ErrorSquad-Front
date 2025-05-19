export async function login(email, senha) {
    try {
        const response = await fetch('https://errorsquad-server.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Erro ao parsear resposta:', e);
            throw new Error('Erro ao processar resposta do servidor.');
        }

        if (response.status === 400) {
            throw new Error(data?.message || 'Requisição inválida. Verifique os dados enviados.');
        } else if (response.status === 401) {
            throw new Error(data?.message || 'Credenciais inválidas. Não autorizado.');
        } else if (response.status === 403) {
            throw new Error(data?.message || 'Acesso negado. Você não tem permissão para acessar este recurso.');
        } else if (response.status === 404) {
            throw new Error(data?.message || 'Recurso não encontrado.');
        } else if (response.status === 500) {
            throw new Error(data?.message || 'Erro interno do servidor. Tente novamente mais tarde.');
        } else if (!response.ok) {
            throw new Error(data?.message || `Erro desconhecido. Código: ${response.status}`);
        }

        if (!data.data || !data.data.token) {
            throw new Error('Resposta inválida do servidor.');
        }

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.id);
        localStorage.setItem('userName', data.data.nome);
        return true;

    } catch (error) {
        console.error('Erro detalhado:', error);
        throw error;
    }
}

export function logout() {
    // Remover dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // Redirecionar para a página de login
    window.location.href = '/login.html';
}

export function getToken() {
    return localStorage.getItem('token');
}

export function isAuthenticated() {
    return !!getToken();
}

export function getUserData() {
    return {
        id: localStorage.getItem('userId'),
        nome: localStorage.getItem('userName'),
        token: getToken()
    };
}

// Função para decodificar o payload do JWT (sem validar assinatura, apenas para ler o ID)
export function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

// Função para validar token e ID da URL
export function validateTokenOrLogout() {
    const token = getToken();
    if (!token) {
        logout();
        return;
    }
    const payload = parseJwt(token);
    if (!payload || !payload.id) {
        logout();
        return;
    }
    // Se passou por tudo, acesso liberado!
} 