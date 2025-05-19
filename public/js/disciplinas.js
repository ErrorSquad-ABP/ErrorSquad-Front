import { getDisciplinas, createDisciplina, updateDisciplina, deleteDisciplina } from './fetchFunctions/fetchDisciplinas.js';
import { getDocentes } from './fetchFunctions/fetchDocentes.js';
import { getCursos } from './fetchFunctions/fetchCursos.js';
import { showToast } from './toast.js';

// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// Script específico para a página de Disciplinas
document.addEventListener("DOMContentLoaded", function() {
    // Elementos
    const disciplinasList = document.getElementById("disciplinas-list");
    const searchInput = document.getElementById("search-disciplina");
    const addDisciplinaBtn = document.getElementById("add-disciplina");
    
    // Lista de professores (REMOVIDO - agora vem do backend)
    // const professores = [
    //     "João Silva",
    //     "Maria Santos",
    //     "Pedro Oliveira",
    //     "Ana Costa",
    //     "Carlos Pereira",
    //     "Lucia Mendes",
    //     "Rafael Souza",
    //     "Juliana Lima"
    // ];

    // Função para preencher os selects de professores e cursos com dados reais
    async function preencherSelectsDisciplina() {
        // Preencher professores
        const selectAdicionar = document.getElementById('professor');
        const selectEditar = document.getElementById('edit-professor');
        selectAdicionar.innerHTML = '<option value="">Selecione o professor</option>';
        selectEditar.innerHTML = '<option value="">Selecione o professor</option>';
        try {
            const docentes = await getDocentes();
            docentes.forEach(docente => {
                const optionAdd = document.createElement('option');
                optionAdd.value = docente.nome;
                optionAdd.textContent = docente.nome;
                selectAdicionar.appendChild(optionAdd);
                const optionEdit = document.createElement('option');
                optionEdit.value = docente.nome;
                optionEdit.textContent = docente.nome;
                selectEditar.appendChild(optionEdit);
            });
        } catch (error) {
            console.error('Erro ao carregar docentes:', error);
        }
        // Preencher cursos
        const selectCursoAdd = document.getElementById('curso');
        const selectCursoEdit = document.getElementById('edit-curso');
        selectCursoAdd.innerHTML = '<option value="">Selecione o curso</option>';
        selectCursoEdit.innerHTML = '<option value="">Selecione o curso</option>';
        try {
            const cursos = await getCursos();
            cursos.forEach(curso => {
                const optionAdd = document.createElement('option');
                optionAdd.value = curso.sigla;
                optionAdd.textContent = curso.sigla;
                selectCursoAdd.appendChild(optionAdd);
                const optionEdit = document.createElement('option');
                optionEdit.value = curso.sigla;
                optionEdit.textContent = curso.sigla;
                selectCursoEdit.appendChild(optionEdit);
            });
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    }
    
    // Variável global para armazenar todas as disciplinas
    let todasDisciplinas = [];

    // Função para carregar disciplinas
    async function carregarDisciplinas() {
        try {
            const response = await getDisciplinas();
            console.log('Resposta completa:', response);
            
            if (response && response.data) {
                todasDisciplinas = response.data;
                renderDisciplinas(todasDisciplinas);
            } else {
                console.error('Resposta inválida da API:', response);
                renderDisciplinas([]); // Usar a mensagem vazia padronizada
            }
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
            renderDisciplinas([]); // Usar a mensagem vazia padronizada
        }
    }
    
    // Função para renderizar os cards de disciplinas
    function renderDisciplinas(disciplinasToRender = []) {
        disciplinasList.innerHTML = "";
        
        if (disciplinasToRender.length === 0) {
            disciplinasList.innerHTML = `
                <div class="mensagem-vazia">
                    <i class="fas fa-info-circle"></i>
                    <p>Nenhuma disciplina cadastrada no momento.</p>
                </div>
            `;
            return;
        }
        
        // Pequeno delay para garantir que a animação seja visível
        setTimeout(() => {
            disciplinasToRender.forEach((disciplina, index) => {
                // Badge de curso
                let badgeClass = '';
                let cursoLabel = (disciplina.sigla_curso || '').toUpperCase();
                switch (cursoLabel) {
                    case 'DSM': badgeClass = 'badge-dsm'; break;
                    case 'GEO': badgeClass = 'badge-geo'; break;
                    case 'MAR': badgeClass = 'badge-mar'; break;
                    default: badgeClass = 'badge-dsm'; // fallback
                }
                const card = document.createElement('div');
                card.className = 'disciplina-card';
                card.style.animationDelay = `${(index + 1) * 0.1}s`;
                card.innerHTML = `
                    <div class="disciplina-header">
                        <span class="badge ${badgeClass}">${cursoLabel}</span>
                        <h3>${disciplina.nome_disciplina}</h3>
                    </div>
                    <div class="disciplina-info">
                        <p><i class="fas fa-user"></i> ${disciplina.nome_docente}</p>
                        <p><i class="fas fa-hashtag"></i> ID: ${disciplina.id_disciplina}</p>
                    </div>
                    <div class="disciplina-actions">
                        <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
                    </div>
                `;

                // Adicionar eventos aos botões
                const btnEdit = card.querySelector('.btn-edit');
                const btnDelete = card.querySelector('.btn-delete');

                btnEdit.addEventListener('click', () => {
                    abrirModalEditarDisciplina(disciplina);
                });

                btnDelete.addEventListener('click', () => {
                    abrirModalConfirmarDelecao(disciplina);
                });

                disciplinasList.appendChild(card);
            });
        }, 100);
    }
    
    // Função para criar um card de disciplina
    function createDisciplinaCard(disciplina) {
        const card = document.createElement("div");
        card.className = "disciplina-card";
        card.dataset.id = disciplina.id;
        
        // Definir classe do curso
        let cursoClass = "";
        switch(disciplina.curso) {
            case "DSM": cursoClass = "curso-dsm"; break;
            case "GEO": cursoClass = "curso-geo"; break;
            case "MAR": cursoClass = "curso-mar"; break;
        }
        
        card.innerHTML = `
            <div class="disciplina-header">
                <div class="disciplina-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="disciplina-info">
                    <h3>${disciplina.nome}</h3>
                    <p class="professor">${disciplina.professor}</p>
                    <span class="disciplina-curso ${cursoClass}">${disciplina.curso}</span>
                </div>
            </div>
            <div class="disciplina-actions">
                <button class="btn-edit" onclick="editDisciplina(${disciplina.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteDisciplina(${disciplina.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Função de busca
    function searchDisciplinas(query) {
        if (!query) {
            renderDisciplinas(todasDisciplinas);
            return;
        }

        query = query.toLowerCase();
        const filteredDisciplinas = todasDisciplinas.filter(disciplina => 
            disciplina.nome_disciplina.toLowerCase().includes(query) ||
            disciplina.nome_docente.toLowerCase().includes(query) ||
            disciplina.sigla_curso.toLowerCase().includes(query)
        );
        
        renderDisciplinas(filteredDisciplinas);
    }

    // Funções para controle do Modal de Adição
    function abrirModalAdicionarDisciplina() {
        const modal = document.getElementById('modal-adicionar-disciplina');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function fecharModalAdicionarDisciplina() {
        const modal = document.getElementById('modal-adicionar-disciplina');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        limparFormularioDisciplina();
    }

    // Função para abrir o modal de edição e preencher os dados
    function abrirModalEditarDisciplina(disciplina) {
        const modal = document.getElementById('modal-editar-disciplina');
        const form = document.getElementById('form-editar-disciplina');
        document.getElementById('edit-id').value = disciplina.id_disciplina;
        document.getElementById('edit-nome').value = disciplina.nome_disciplina;
        document.getElementById('edit-professor').value = disciplina.nome_docente;
        document.getElementById('edit-curso').value = disciplina.sigla_curso;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Função para fechar o modal de edição
    function fecharModalEditarDisciplina() {
        const modal = document.getElementById('modal-editar-disciplina');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        limparFormularioEdicao();
    }

    // Função para abrir o modal de confirmação de deleção
    function abrirModalConfirmarDelecao(disciplina) {
        const modal = document.getElementById('modal-confirmar-delecao');
        const disciplinaDelete = document.getElementById('disciplina-delete');
        disciplinaDelete.textContent = `${disciplina.nome_disciplina}`;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        modal.dataset.disciplinaId = disciplina.id_disciplina;
    }

    // Função para fechar o modal de deleção
    function fecharModalConfirmarDelecao() {
        const modal = document.getElementById('modal-confirmar-delecao');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Adicionar eventos aos botões dos cards
    function adicionarEventosAosCards() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = btn.closest('.disciplina-card');
                const id = card.querySelector('.disciplina-info p:last-child').textContent.replace('ID: ', '').trim();
                const disciplina = [];
                if (disciplina.find(d => d.id_disciplina == id)) abrirModalEditarDisciplina(disciplina.find(d => d.id_disciplina == id));
            });
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const card = btn.closest('.disciplina-card');
                const id = card.querySelector('.disciplina-info p:last-child').textContent.replace('ID: ', '').trim();
                const disciplina = [];
                if (disciplina.find(d => d.id_disciplina == id)) abrirModalConfirmarDelecao(disciplina.find(d => d.id_disciplina == id));
            });
        });
    }

    // Atualizar renderDisciplinas para adicionar eventos após renderizar
    const renderDisciplinasOriginal = renderDisciplinas;
    renderDisciplinas = function(...args) {
        renderDisciplinasOriginal.apply(this, args);
        adicionarEventosAosCards();
    };

    // Eventos dos modais
    document.querySelector('#modal-editar-disciplina .close-modal').addEventListener('click', fecharModalEditarDisciplina);
    document.getElementById('cancelar-editar').addEventListener('click', fecharModalEditarDisciplina);
    document.querySelector('#modal-confirmar-delecao .close-modal').addEventListener('click', fecharModalConfirmarDelecao);
    document.getElementById('cancelar-delecao').addEventListener('click', fecharModalConfirmarDelecao);

    // Função para salvar disciplina
    async function salvarDisciplina() {
        if (!validarFormularioDisciplina()) {
            return;
        }

        const nome = document.getElementById('nome').value;
        const professorId = document.getElementById('professor').value;
        const cursoId = document.getElementById('curso').value;

        try {
            const disciplinaData = {
                nome: nome,
                docente: professorId,
                curso: cursoId
            };

            console.log('Dados sendo enviados:', disciplinaData);
            const result = await createDisciplina(disciplinaData);
            console.log('Resultado da criação:', result);
            
            if (result) {
                showToast('Disciplina adicionada com sucesso!', 'success');
                fecharModalAdicionarDisciplina();
                // Aguardar um momento antes de recarregar para garantir que o backend processou
                setTimeout(() => {
                    carregarDisciplinas();
                }, 1000);
            }
        } catch (error) {
            console.error('Erro ao salvar disciplina:', error);
            showToast('Erro ao adicionar disciplina. Tente novamente.', 'error');
        }
    }

    // Função para salvar edição
    async function salvarEdicao() {
        if (!validarFormularioEdicao()) {
            return;
        }

        const id = document.getElementById('edit-id').value;
        const nome = document.getElementById('edit-nome').value;
        const professorNome = document.getElementById('edit-professor').value;
        const cursoSigla = document.getElementById('edit-curso').value;

        try {
            const disciplinaData = {
                id: id,
                nome: nome,
                nome_docente: professorNome,
                nome_curso: cursoSigla
            };

            const result = await updateDisciplina(id, disciplinaData);
            
            if (result) {
                showToast('Disciplina atualizada com sucesso!', 'success');
                fecharModalEditarDisciplina();
                setTimeout(() => {
                    carregarDisciplinas();
                }, 1000);
            }
        } catch (error) {
            console.error('Erro ao atualizar disciplina:', error);
            showToast('Erro ao atualizar disciplina. Tente novamente.', 'error');
        }
    }

    // Adicionar event listeners
    document.getElementById('salvar-disciplina').addEventListener('click', salvarDisciplina);
    document.getElementById('salvar-edicao').addEventListener('click', salvarEdicao);
    document.getElementById('confirmar-delecao').addEventListener('click', async function() {
        const modal = document.getElementById('modal-confirmar-delecao');
        const disciplinaId = modal.dataset.disciplinaId;
        
        try {
            await deleteDisciplina(disciplinaId);
            showToast('Disciplina excluída com sucesso!', 'success');
            fecharModalConfirmarDelecao();
            carregarDisciplinas(); // Recarrega a lista após excluir
        } catch (error) {
            console.error('Erro ao excluir disciplina:', error);
            showToast('Erro ao excluir disciplina. Tente novamente.', 'error');
        }
    });

    // Event listeners para os botões de cancelar
    document.getElementById('cancelar-adicionar').addEventListener('click', fecharModalAdicionarDisciplina);
    document.getElementById('cancelar-editar').addEventListener('click', fecharModalEditarDisciplina);
    document.getElementById('cancelar-delecao').addEventListener('click', fecharModalConfirmarDelecao);

    // Event listener para o botão de adicionar
    document.getElementById('add-disciplina').addEventListener('click', abrirModalAdicionarDisciplina);

    // Event Listeners
    searchInput.addEventListener("input", (e) => {
        searchDisciplinas(e.target.value);
    });
    
    // Funções globais para edição e exclusão
    window.editDisciplina = function(id) {
        const disciplina = [];
        if (disciplina.find(d => d.id_disciplina === id)) {
            abrirModalEditarDisciplina(disciplina.find(d => d.id_disciplina === id));
        }
    };
    
    window.deleteDisciplina = function(id) {
        const disciplina = [];
        if (disciplina.find(d => d.id_disciplina === id)) {
            abrirModalConfirmarDelecao(disciplina.find(d => d.id_disciplina === id));
        }
    };
    
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
        
        element.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    // Função para validar o formulário de adição
    function validarFormularioDisciplina() {
        let isValid = true;
        const nome = document.getElementById('nome').value.trim();
        const professor = document.getElementById('professor').value.trim();
        const curso = document.getElementById('curso').value.trim();
        
        // Limpar erros anteriores
        clearError('nome');
        clearError('professor');
        clearError('curso');
        
        if (!nome) {
            showError('nome', 'Por favor, preencha o nome da disciplina');
            isValid = false;
        }
        
        if (!professor) {
            showError('professor', 'Por favor, selecione um professor');
            isValid = false;
        }
        
        if (!curso) {
            showError('curso', 'Por favor, selecione um curso');
            isValid = false;
        }
        
        return isValid;
    }

    // Função para validar o formulário de edição
    function validarFormularioEdicao() {
        let isValid = true;
        const nome = document.getElementById('edit-nome').value.trim();
        const professor = document.getElementById('edit-professor').value.trim();
        const curso = document.getElementById('edit-curso').value.trim();
        
        // Limpar erros anteriores
        clearError('edit-nome');
        clearError('edit-professor');
        clearError('edit-curso');
        
        if (!nome) {
            showError('edit-nome', 'Por favor, preencha o nome da disciplina');
            isValid = false;
        }
        
        if (!professor) {
            showError('edit-professor', 'Por favor, selecione um professor');
            isValid = false;
        }
        
        if (!curso) {
            showError('edit-curso', 'Por favor, selecione um curso');
            isValid = false;
        }
        
        return isValid;
    }

    // Função para limpar formulário
    function limparFormularioDisciplina() {
        const form = document.getElementById('form-adicionar-disciplina');
        form.reset();
        clearError('nome');
        clearError('professor');
        clearError('curso');
    }

    // Função para limpar formulário de edição
    function limparFormularioEdicao() {
        const form = document.getElementById('form-editar-disciplina');
        form.reset();
        clearError('edit-nome');
        clearError('edit-professor');
        clearError('edit-curso');
    }
    
    // Inicializar a página
    preencherSelectsDisciplina();
    carregarDisciplinas();
}); 