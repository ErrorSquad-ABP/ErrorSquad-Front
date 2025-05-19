// Configuração da API
const API_URL = 'https://errorsquad-server.onrender.com';

// Função para obter o token
function getToken() {
    return localStorage.getItem('token');
}

// Função para obter o ID do admin
function getAdminId() {
    return localStorage.getItem('userId');
}

// Função para buscar os dados da grade
async function fetchGradeData() {
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
        console.log('Resposta da API:', result);
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0];
        } else {
            console.error('Erro: Dados não encontrados na resposta');
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar dados da grade:', error);
        throw error;
    }
}

// Função para fazer upload do CSV
async function uploadCSV(file) {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = '/public/login.html';
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);

        console.log('Enviando arquivo CSV...');
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/grade/import`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resposta do upload:', result);
        return result;
    } catch (error) {
        console.error('Erro ao fazer upload do CSV:', error);
        throw error;
    }
}

// Função para filtrar docentes por curso, nível e turno
function filtrarDocentes(docentes, periodos, curso, nivel, turno) {
    // Primeiro, filtrar os períodos
    const periodosFiltrados = periodos.filter(periodo => {
        const siglaCurso = (periodo.sigla_curso || '').toUpperCase();
        const nivelSemestre = (periodo.nivel_semestre || '').toString();
        const nomeTurno = (periodo.nome_turno || '').toLowerCase();
        return siglaCurso === curso &&
               nivelSemestre === nivel &&
               nomeTurno === turno;
    });

    // Obter nomes dos docentes dos períodos filtrados
    const nomesDocentes = [...new Set(periodosFiltrados
        .filter(p => p.nome_docente)
        .map(p => p.nome_docente))];

    // Filtrar a lista completa de docentes
    return docentes.filter(docente => 
        nomesDocentes.includes(docente.nome)
    );
}

// Exportar as funções
export {
    fetchGradeData,
    uploadCSV,
    filtrarDocentes,
    getToken,
    getAdminId
}; 