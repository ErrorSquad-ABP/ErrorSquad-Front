// May God Have Mercy on Our Souls

// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// Importando as funções do fetchSemestres.js
import { getSemestres, createSemestre, updateSemestre, deleteSemestre } from './fetchFunctions/fetchSemestres.js';
import { showToast } from './toast.js';

let semestres = [];
let semestreEditando = null;

const siglasCursosFixas = ['DSM', 'GEO', 'MAR'];
const turnosFixos = ['Matutino', 'Noturno'];

// Mapeamento de siglas para IDs
const cursoIds = {
    'DSM': 1,
    'GEO': 2,
    'MAR': 3
};

function popularSelectsSemestre() {
    // Cursos
    const selectsCurso = [document.getElementById('sigla_curso'), document.getElementById('edit-sigla_curso')];
    selectsCurso.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione o curso</option>' +
                siglasCursosFixas.map(sigla => `<option value="${sigla}">${sigla}</option>`).join('');
        }
    });

    // Turnos
    const selectsTurno = [document.getElementById('nome_turno'), document.getElementById('edit-nome_turno')];
    selectsTurno.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Selecione o turno</option>' +
                turnosFixos.map(turno => `<option value="${turno}">${turno}</option>`).join('');
        }
    });
}

// Função para carregar dados do backend
async function carregarDados() {
    try {
        const data = await getSemestres();
        if (!data) {
            console.warn('Nenhum dado retornado do servidor, inicializando array vazio');
            semestres = [];
        } else {
            semestres = data;
        }
        renderSemestres();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados. Por favor, verifique sua conexão e tente novamente.', 'error');
        // Redirecionar para login se o token estiver inválido
        if (error.message.includes('Token inválido') || error.message.includes('não autorizado')) {
            window.location.href = '/login';
        }
    }
}

// Give Us This Day Our Daily Bread,
function renderSemestres() {
    const semestresList = document.getElementById('semestres-list');
    if (!semestresList) return;

    semestresList.innerHTML = '';

    semestres.forEach(semestre => {
        const card = createSemestreCard(semestre);
        semestresList.appendChild(card);
    });

    // Adiciona os event listeners após renderizar os cards
    semestresList.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const semestreId = parseInt(button.dataset.semestreId);
            const semestre = semestres.find(s => s.id_semestre_cronograma === semestreId);
            if (semestre) {
                abrirModalEditarSemestre(semestre);
            }
        });
    });

    semestresList.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const semestreId = parseInt(button.dataset.semestreId);
            const semestre = semestres.find(s => s.id_semestre_cronograma === semestreId);
            if (semestre) {
                abrirModalConfirmarDelecao(semestre);
            }
        });
    });
}

// Função para criar o card do semestre
function createSemestreCard(semestre) {
    const card = document.createElement('div');
    card.className = 'semestre-card';

    const ano = semestre.ano_semestre_cronograma || '';
    const nivel = semestre.nivel_semestre_cronograma || '';
    const siglaCurso = semestre.sigla_curso || '';
    const nomeTurno = semestre.nome_turno || '';

    // Definir classes de cor para badges
    let badgeCursoClass = '';
    switch (siglaCurso.toLowerCase()) {
        case 'dsm': badgeCursoClass = 'badge-dsm'; break;
        case 'geo': badgeCursoClass = 'badge-geo'; break;
        case 'mar': badgeCursoClass = 'badge-mar'; break;
        default: badgeCursoClass = 'badge-default'; break;
    }
    let badgeTurnoClass = '';
    switch (nomeTurno.toLowerCase()) {
        case 'noturno': badgeTurnoClass = 'badge-noturno'; break;
        case 'matutino': badgeTurnoClass = 'badge-matutino'; break;
        case 'vespertino': badgeTurnoClass = 'badge-vespertino'; break;
        default: badgeTurnoClass = 'badge-default'; break;
    }

    card.innerHTML = `
        <div class="semestre-header">
            <div class="semestre-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="semestre-info">
                <h3>${ano} - ${nivel}º Nível</h3>
                <div style="margin-bottom: 6px;">
                    <span class="badge ${badgeCursoClass}">${siglaCurso.toUpperCase()}</span>
                    <span class="badge ${badgeTurnoClass}">${nomeTurno}</span>
                </div>
            </div>
        </div>
        <div class="semestre-details">
            <div class="semestre-detail">
                <span class="detail-label">Ano</span>
                <span class="detail-value">${ano}</span>
            </div>
            <div class="semestre-detail">
                <span class="detail-label">Nível</span>
                <span class="detail-value">${nivel}</span>
            </div>
        </div>
        <div class="semestre-actions">
            <button class="btn-edit" data-semestre-id="${semestre.id_semestre_cronograma}">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-delete" data-semestre-id="${semestre.id_semestre_cronograma}">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `;
    return card;
}

// Função para salvar semestre
async function salvarSemestre() {
    try {
        console.log('Iniciando salvamento do semestre...');
        if (!validarFormularioSemestre()) {
            console.log('Validação do formulário falhou');
            return;
        }

        const form = document.getElementById('form-adicionar-semestre');
        const formData = new FormData(form);
        const siglaCurso = formData.get('sigla_curso');
        
        console.log('Sigla do curso selecionada:', siglaCurso);
        console.log('ID do curso mapeado:', cursoIds[siglaCurso]);

        // Garantir que os campos estejam no formato correto
        const novoSemestre = {
            ano: String(formData.get('ano')).trim(),
            nivel: String(formData.get('nivel')).trim(),
            nome_curso: String(siglaCurso).toUpperCase().trim(),
            nome_turno: String(formData.get('nome_turno')).trim()
        };

        console.log('Dados do semestre a serem enviados:', novoSemestre);
        console.log('Tipo dos dados:', {
            ano: typeof novoSemestre.ano,
            nivel: typeof novoSemestre.nivel,
            nome_curso: typeof novoSemestre.nome_curso,
            nome_turno: typeof novoSemestre.nome_turno
        });

        const result = await createSemestre(novoSemestre);
        console.log('Resultado da criação:', result);
        
        if (result) {
            await carregarDados();
            fecharModalAdicionarSemestre();
            showToast('Semestre adicionado com sucesso!', 'success');
            limparFormularioSemestre();
        } else {
            showToast('Erro ao adicionar semestre. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar semestre:', error);
        showToast('Erro ao adicionar semestre. Por favor, tente novamente.', 'error');
    }
}

// Função para atualizar semestre
async function atualizarSemestre() {
    try {
        if (!validarFormularioEdicao()) return;

        const form = document.getElementById('form-editar-semestre');
        const formData = new FormData(form);

        // Log dos valores brutos do formulário
        console.log('Valores do formulário:', {
            id: formData.get('id_semestre_cronograma'),
            ano: formData.get('ano_semestre_cronograma'),
            nivel: formData.get('nivel_semestre_cronograma'),
            curso: formData.get('sigla_curso'),
            turno: formData.get('nome_turno')
        });

        // Garantir que os valores numéricos sejam válidos
        const id = parseInt(formData.get('id_semestre_cronograma'));
        const ano = parseInt(formData.get('ano_semestre_cronograma'));
        const nivel = parseInt(formData.get('nivel_semestre_cronograma'));

        // Log dos valores convertidos
        console.log('Valores convertidos:', { id, ano, nivel });

        // Verificar se os valores numéricos são válidos
        if (isNaN(id) || isNaN(ano) || isNaN(nivel)) {
            console.error('Valores inválidos:', { id, ano, nivel });
            showToast('Erro: Valores inválidos no formulário', 'error');
            return;
        }

        // Ajustando o formato dos dados para corresponder ao esperado pela API
        const semestreAtualizado = {
            id_semestre_cronograma: id,
            ano_semestre_cronograma: ano,
            nivel_semestre_cronograma: nivel,
            sigla_curso: (formData.get('sigla_curso') || '').toUpperCase(),
            nome_turno: formData.get('nome_turno') || ''
        };

        console.log('Dados a serem enviados:', semestreAtualizado);

        const result = await updateSemestre(semestreAtualizado);
        if (result) {
            await carregarDados();
            fecharModalEditarSemestre();
            showToast('Semestre atualizado com sucesso!', 'success');
        } else {
            showToast('Erro ao atualizar semestre. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar semestre:', error);
        showToast('Erro ao atualizar semestre. Por favor, tente novamente.', 'error');
    }
}

// Função para deletar semestre
async function deletarSemestre(id) {
    try {
        const response = await deleteSemestre(id);

        if (response.status === 200) {
            fecharModalConfirmarDelecao();
            semestres = semestres.filter(s => s.id !== id);
            renderSemestres();
            showToast('Semestre excluído com sucesso!', 'success');
            await carregarDados();
        } else {
            showToast('Erro ao excluir semestre. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        showToast('Erro ao excluir semestre. Por favor, tente novamente.', 'error');
    }
}

// Funções para controle do Modal de Adição
function abrirModalAdicionarSemestre() {
    popularSelectsSemestre();
    const modal = document.getElementById('modal-adicionar-semestre');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModalAdicionarSemestre() {
    const modal = document.getElementById('modal-adicionar-semestre');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    limparFormularioSemestre();
}

// Funções para controle do Modal de Edição
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function abrirModalEditarSemestre(semestre) {
    popularSelectsSemestre();
    const modal = document.getElementById('modal-editar-semestre');
    
    // Preencher os campos do formulário
    document.getElementById('edit-id_semestre_cronograma').value = semestre.id_semestre_cronograma;
    document.getElementById('edit-ano_semestre_cronograma').value = semestre.ano_semestre_cronograma;
    document.getElementById('edit-nivel_semestre_cronograma').value = semestre.nivel_semestre_cronograma;
    document.getElementById('edit-sigla_curso').value = (semestre.sigla_curso || '').toUpperCase();
    document.getElementById('edit-nome_turno').value = semestre.nome_turno || '';
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModalEditarSemestre() {
    const modal = document.getElementById('modal-editar-semestre');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    document.getElementById('form-editar-semestre').reset();
}

// Funções para controle do Modal de Deleção
function abrirModalConfirmarDelecao(semestre) {
    const modal = document.getElementById('modal-confirmar-delecao');
    const semestreDelete = document.getElementById('semestre-delete');
    semestreDelete.textContent = `Tem certeza que deseja excluir o semestre ${semestre.ano_semestre_cronograma} - ${semestre.nivel_semestre_cronograma}º Nível (Curso: ${semestre.sigla_curso})?\n\nEsta ação não pode ser desfeita!`;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    modal.dataset.semestreId = semestre.id_semestre_cronograma;
}

function fecharModalConfirmarDelecao() {
    const modal = document.getElementById('modal-confirmar-delecao');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Função para buscar semestres
function searchSemestres(query) {
    if (!query) {
        renderSemestres(semestres);
        return;
    }

    const searchTerm = query.toLowerCase().trim();
    
    const filteredSemestres = semestres.filter(semestre => {
        const ano = String(semestre.ano_semestre_cronograma || '').toLowerCase();
        const nivel = String(semestre.nivel_semestre_cronograma || '').toLowerCase();
        const curso = String(semestre.sigla_curso || '').toLowerCase();
        const turno = String(semestre.nome_turno || '').toLowerCase();

        return ano.includes(searchTerm) ||
               nivel.includes(searchTerm) ||
               curso.includes(searchTerm) ||
               turno.includes(searchTerm);
    });
    
    renderSemestres(filteredSemestres);
}

// Função para mostrar mensagem de erro
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    
    element.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Função para limpar mensagem de erro
function clearError(elementId) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    if (element) element.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

// Função para validar o formulário de adição
function validarFormularioSemestre() {
    let isValid = true;
    const ano = document.getElementById('ano').value.trim();
    const nivel = document.getElementById('nivel').value.trim();
    const sigla_curso = document.getElementById('sigla_curso').value.trim();
    const nome_turno = document.getElementById('nome_turno').value.trim();

    clearError('ano');
    clearError('nivel');
    clearError('sigla_curso');
    clearError('nome_turno');

    if (!ano || isNaN(ano) || ano < 2024 || ano > 2100) {
        showError('ano', 'Por favor, preencha um ano válido (2024-2100)');
        isValid = false;
    }
    if (!nivel) {
        showError('nivel', 'Por favor, preencha o nível');
        isValid = false;
    }
    if (!sigla_curso) {
        showError('sigla_curso', 'Por favor, selecione o curso');
        isValid = false;
    }
    if (!nome_turno) {
        showError('nome_turno', 'Por favor, selecione o turno');
        isValid = false;
    }
    return isValid;
}

// Função para validar o formulário de edição
function validarFormularioEdicao() {
    let isValid = true;
    const ano = document.getElementById('edit-ano_semestre_cronograma').value.trim();
    const nivel = document.getElementById('edit-nivel_semestre_cronograma').value.trim();
    const sigla_curso = document.getElementById('edit-sigla_curso').value.trim();
    const nome_turno = document.getElementById('edit-nome_turno').value.trim();

    console.log('Valores do formulário para validação:', { ano, nivel, sigla_curso, nome_turno });

    clearError('edit-ano_semestre_cronograma');
    clearError('edit-nivel_semestre_cronograma');
    clearError('edit-sigla_curso');
    clearError('edit-nome_turno');

    // Validar ano
    if (!ano || isNaN(ano) || parseInt(ano) < 2024 || parseInt(ano) > 2100) {
        showError('edit-ano_semestre_cronograma', 'Por favor, preencha um ano válido (2024-2100)');
        isValid = false;
    }

    // Validar nível
    if (!nivel || isNaN(nivel) || parseInt(nivel) < 1 || parseInt(nivel) > 10) {
        showError('edit-nivel_semestre_cronograma', 'Por favor, preencha um nível válido (1-10)');
        isValid = false;
    }

    // Validar curso
    if (!sigla_curso) {
        showError('edit-sigla_curso', 'Por favor, selecione o curso');
        isValid = false;
    }

    // Validar turno
    if (!nome_turno) {
        showError('edit-nome_turno', 'Por favor, selecione o turno');
        isValid = false;
    }

    console.log('Resultado da validação:', isValid);
    return isValid;
}

// Função para limpar formulário
function limparFormularioSemestre() {
    const form = document.getElementById('form-adicionar-semestre');
    form.reset();
    clearError('ano');
    clearError('nivel');
    clearError('sigla_curso');
    clearError('nome_turno');
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    
    // Event listeners para os botões
    document.getElementById('add-semestre')?.addEventListener('click', abrirModalAdicionarSemestre);
    document.getElementById('salvar-semestre')?.addEventListener('click', salvarSemestre);
    document.getElementById('salvar-edicao')?.addEventListener('click', atualizarSemestre);
    
    // Event listeners para os modais
    document.querySelector('#modal-adicionar-semestre .close-modal')?.addEventListener('click', fecharModalAdicionarSemestre);
    document.querySelector('#modal-editar-semestre .close-modal')?.addEventListener('click', fecharModalEditarSemestre);
    document.querySelector('#modal-confirmar-delecao .close-modal')?.addEventListener('click', fecharModalConfirmarDelecao);
    document.getElementById('cancelar-adicionar')?.addEventListener('click', fecharModalAdicionarSemestre);
    document.getElementById('cancelar-editar')?.addEventListener('click', fecharModalEditarSemestre);
    document.getElementById('cancelar-delecao')?.addEventListener('click', fecharModalConfirmarDelecao);
    document.getElementById('confirmar-delecao')?.addEventListener('click', function() {
        const modal = document.getElementById('modal-confirmar-delecao');
        const semestreId = parseInt(modal.dataset.semestreId);
        deletarSemestre(semestreId);
    });
    
    // Event listener para busca
    document.getElementById('search-semestre')?.addEventListener('input', (e) => {
        searchSemestres(e.target.value);
    });
});

// For Thine is the Kingdom, and the Power, and the Glory, for ever and ever. Amen. 

function addSemestre(disciplinaId) {
    const btn = document.querySelector(`[data-add-semestre="${disciplinaId}"]`);
    const originalText = btn.innerHTML;
    
    // Desabilita o botão e mostra loading
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
    
    fetch(`/api/disciplinas/${disciplinaId}/semestres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao adicionar semestre');
        }
        return response.json();
    })
    .then(data => {
        // Feedback visual de sucesso
        btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        btn.classList.add('success');
        
        // Atualiza a lista de semestres
        updateSemestresList(disciplinaId, data.semestres);
        
        // Restaura o botão após 2 segundos
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('success');
        }, 2000);
    })
    .catch(error => {
        console.error('Erro:', error);
        // Feedback visual de erro
        btn.innerHTML = '<i class="fas fa-times"></i> Erro!';
        btn.classList.add('error');
        
        // Restaura o botão após 2 segundos
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('error');
        }, 2000);
    });
}

function updateSemestresList(disciplinaId, semestres) {
    const semestresContainer = document.querySelector(`#semestres-${disciplinaId}`);
    if (semestresContainer) {
        semestresContainer.innerHTML = semestres.map(semestre => `
            <div class="semestre-item">
                <span>${semestre.ano}/${semestre.periodo}</span>
                <button onclick="removeSemestre(${disciplinaId}, ${semestre.id})" class="btn-remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
} 