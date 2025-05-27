const API_URL = 'https://errorsquad-server.onrender.com';

function getAdminId() {
    return localStorage.getItem('userId');
}

// Função para obter o token
function getToken() {
    return localStorage.getItem('token');
}

export async function getSalasInfo() {
    try {
        const token = getToken();
        if (!token) {
                window.location.href = '/public/login.html';
                return null;
        }

        console.log('Buscando dados da grade...');
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/grade`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("A resposta não é um JSON válido!");
        }

        const result = await response.json();
        console.log('Resposta da API:', result.data[0].periodos || 'Períodos não encontrados');
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0].periodos || 'Períodos não encontrados';
        } else {
            console.error('Erro: Dados não encontrados na resposta');
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar dados da grade:', error);
        throw error;
    }
}