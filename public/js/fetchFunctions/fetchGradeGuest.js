// Configuração da API
const API_URL = 'https://gerenciamento-pedagogico-server.koyeb.app';

// Função para buscar os dados da grade
async function fetchGradeData() {
        const response = await fetch(`${API_URL}/guest/grade`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("A resposta não é um JSON válido!");
        }

        const result = await response.json();
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0];
        } else {
            console.error('Erro: Dados não encontrados na resposta');
            return null;
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
    filtrarDocentes
}; 
