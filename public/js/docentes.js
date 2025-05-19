// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// Importando as funções do fetchDocentes.js
import { getDocentes, createDocente, updateDocente, deleteDocente } from './fetchFunctions/fetchDocentes.js';
import { showToast } from './toast.js';

let docentes = [];
let docenteEditando = null;

// Função para salvar no localStorage
function salvarDados() {
    try {
        localStorage.setItem('docentes', JSON.stringify(docentes));
        console.warn('Dados salvos:', docentes);
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para carregar dados do backend
async function carregarDados() {
    try {
        const data = await getDocentes();
        if (!data) {
            console.warn('Nenhum dado retornado do servidor, inicializando array vazio');
            docentes = [];
        } else {
            docentes = data;
        }
        renderDocentes();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlert('Erro ao carregar dados. Por favor, verifique sua conexão e tente novamente.', 'error');
        // Redirecionar para login se o token estiver inválido
        if (error.message.includes('Token inválido') || error.message.includes('não autorizado')) {
            window.location.href = '/login';
        }
    }
}

// Função para limpar o formulário
function clearForm() {
    const form = document.getElementById("formDocente");
    if (!form) return;

    form.reset();
    docenteEditando = null;

    // Resetar texto do botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Salvar';
    }
}

// Função para mostrar mensagens no console
function logMessage(message, type = 'info') {
    switch(type) {
        case 'error':
            console.error(message);
            break;
        case 'warning':
            console.warn(message);
            break;
        default:
            console.log(message);
    }
}

// Função para limpar o localStorage e carregar dados iniciais
function limparEInicializar() {
    localStorage.removeItem('docentes');
    carregarDados();
    renderDocentes();
}

// Funções para gerenciar docentes
document.addEventListener('DOMContentLoaded', function() {
    console.warn('DOM carregado, iniciando...');
    limparEInicializar();
    
    // Configurar busca
    const searchInput = document.getElementById("search-docente");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.docente-card');
            
            cards.forEach(card => {
                const nome = card.querySelector("h3").textContent.toLowerCase();
                
                if (nome.includes(searchTerm)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});

// Funções para controle do Modal de Edição
function abrirModalEditarDocente(docente) {
    const modal = document.getElementById('modal-editar-docente');
    const form = document.getElementById('form-editar-docente');
    
    document.getElementById('edit-id').value = docente.id;
    document.getElementById('edit-nome').value = docente.nome;
    document.getElementById('edit-cor').value = docente.cor || '#FF0000';
    document.getElementById('edit-cor-hex').value = docente.cor || '#FF0000';
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModalEditarDocente() {
    const modal = document.getElementById('modal-editar-docente');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    limparFormularioEdicao();
}

function limparFormularioEdicao() {
    const form = document.getElementById('form-editar-docente');
    form.reset();
}

// Função para editar docente
async function editarDocente(id) {
    try {
        const docente = docentes.find(d => d.id === id);
        if (!docente) {
            console.error('Erro: Docente não encontrado');
            return;
        }
        
        // Preencher o formulário com os dados do docente
        document.getElementById('edit-id').value = docente.id;
        document.getElementById('edit-nome').value = docente.nome;
        
        // Abrir o modal de edição
        const modal = document.getElementById('modal-editar-docente');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        showAlert('Erro ao carregar dados do docente. Por favor, tente novamente.', 'error');
    }
}

// Funções para controle do Modal de Deleção
function abrirModalConfirmarDelecao(docente) {
    const modal = document.getElementById('modal-confirmar-delecao');
    const nomeDocente = document.getElementById('nome-docente-delete');
    
    nomeDocente.textContent = docente.nome;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Armazenar o ID do docente para uso posterior
    modal.dataset.docenteId = docente.id;
}

function fecharModalConfirmarDelecao() {
    const modal = document.getElementById('modal-confirmar-delecao');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    delete modal.dataset.docenteId;
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    const docente = docentes.find(d => d.id === id);
    if (!docente) {
        console.error('Erro: Docente não encontrado');
        return;
    }
    abrirModalConfirmarDelecao(docente);
}

// Função para exportar para CSV
function exportToCSV() {
    // Implemente a lógica de exportação para CSV aqui
}

// Função para importar CSV
function importCSV() {
    // Implemente a lógica de importação CSV aqui
}

// Funções para controle do Modal
function abrirModalAdicionarDocente() {
    const modal = document.getElementById('modal-adicionar-docente');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Previne rolagem do body
}

function fecharModalAdicionarDocente() {
    const modal = document.getElementById('modal-adicionar-docente');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restaura rolagem do body
    limparFormularioDocente();
}

function limparFormularioDocente() {
    const form = document.getElementById('form-adicionar-docente');
    const nomeInput = document.getElementById('nome');
    const corInput = document.getElementById('cor');
    const corHexInput = document.getElementById('cor-hex');
    
    if (form) {
        form.reset();
    }
    
    if (corInput) {
        corInput.value = '#FF0000';
    }
    
    if (corHexInput) {
        corHexInput.value = '#FF0000';
    }
    
    // Limpar mensagens de erro
    clearError('nome');
    clearError('cor');
    clearError('cor-hex');
}

// Função para mostrar mensagem e manter visível enquanto o modal estiver aberto
function logMessageAndKeepVisible(message, type = 'info') {
    logMessage(message, type);
}

// Função para renderizar os cards dos docentes
function renderDocentes() {
    const docentesList = document.getElementById('docentes-list');
    if (!docentesList) {
        console.error('Elemento docentes-list não encontrado');
        return;
    }

    // Limpar lista atual
    docentesList.innerHTML = '';

    // Verificar se há docentes
    if (docentes.length === 0) {
        const mensagemVazia = document.createElement('div');
        mensagemVazia.className = 'mensagem-vazia';
        mensagemVazia.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>Nenhum docente cadastrado no momento.</p>
        `;
        docentesList.appendChild(mensagemVazia);
        return;
    }

    // Criar cards para cada docente
    docentes.forEach((docente, index) => {
        const card = document.createElement('div');
        card.className = 'docente-card';
        card.innerHTML = `
            <div class="docente-header">
                <div class="docente-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="docente-info">
                    <h3>
                        <span class="docente-color-box" style="background-color: ${docente.cor || '#FF0000'}"></span>
                        ${docente.nome || ''}
                    </h3>
                </div>
            </div>
            <div class="docente-actions">
                <button class="btn-icon btn-edit" data-docente-id="${docente.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" data-docente-id="${docente.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        // Adiciona delay crescente para animação em cascata
        card.style.animationDelay = `${index * 0.07}s`;
        docentesList.appendChild(card);
    });

    // Adicionar event listeners para os botões
    docentesList.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const docenteId = parseInt(button.dataset.docenteId);
            editarDocente(docenteId);
        });
    });

    docentesList.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const docenteId = parseInt(button.dataset.docenteId);
            confirmarExclusao(docenteId);
        });
    });
}

// Event Listeners para o Modal de Adição
document.addEventListener('DOMContentLoaded', function() {
    // Botão para abrir o modal
    const btnAdicionar = document.querySelector('.btn-add');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', abrirModalAdicionarDocente);
    }

    // Botões para fechar o modal
    const closeModal = document.querySelector('.close-modal');
    const btnCancelar = document.getElementById('cancelar-adicionar');
    
    if (closeModal) {
        closeModal.addEventListener('click', fecharModalAdicionarDocente);
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharModalAdicionarDocente);
    }

    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-adicionar-docente');
        if (event.target === modal) {
            fecharModalAdicionarDocente();
        }
    });

    // Manipular envio do formulário
    const btnSalvar = document.getElementById('salvar-docente');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(event) {
            event.preventDefault();
            await salvarDocente();
        });
    }
});

// Event Listeners para o Modal de Edição
document.addEventListener('DOMContentLoaded', function() {
    // Botões para fechar o modal de edição
    const closeModalEditar = document.querySelector('#modal-editar-docente .close-modal');
    const btnCancelarEditar = document.getElementById('cancelar-editar');
    
    if (closeModalEditar) {
        closeModalEditar.addEventListener('click', fecharModalEditarDocente);
    }
    
    if (btnCancelarEditar) {
        btnCancelarEditar.addEventListener('click', fecharModalEditarDocente);
    }

    // Fechar modal de edição ao clicar fora dele
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-editar-docente');
        if (event.target === modal) {
            fecharModalEditarDocente();
        }
    });

    // Manipular envio do formulário de edição
    const btnSalvarEdicao = document.getElementById('salvar-edicao');
    if (btnSalvarEdicao) {
        btnSalvarEdicao.addEventListener('click', async function(event) {
            event.preventDefault();
            await salvarEdicao();
        });
    }
});

// Event Listeners para o Modal de Deleção
document.addEventListener('DOMContentLoaded', function() {
    // Botões para fechar o modal de deleção
    const closeModalDelecao = document.querySelector('#modal-confirmar-delecao .close-modal');
    const btnCancelarDelecao = document.getElementById('cancelar-delecao');
    
    if (closeModalDelecao) {
        closeModalDelecao.addEventListener('click', fecharModalConfirmarDelecao);
    }
    
    if (btnCancelarDelecao) {
        btnCancelarDelecao.addEventListener('click', fecharModalConfirmarDelecao);
    }

    // Fechar modal de deleção ao clicar fora dele
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal-confirmar-delecao');
        if (event.target === modal) {
            fecharModalConfirmarDelecao();
        }
    });

    // Manipular confirmação de deleção
    const btnConfirmarDelecao = document.getElementById('confirmar-delecao');
    if (btnConfirmarDelecao) {
        btnConfirmarDelecao.addEventListener('click', async function() {
            const modal = document.getElementById('modal-confirmar-delecao');
            const docenteId = parseInt(modal.dataset.docenteId);
            
            if (docenteId) {
                await deletarDocente(docenteId);
            }
        });
    }
});

// Função para mostrar alerta personalizado
function showAlert(message, type = 'error') {
    const alert = document.getElementById('custom-alert');
    const alertMessage = alert.querySelector('.alert-message');
    const alertIcon = alert.querySelector('.alert-icon i');
    
    // Configurar o alerta
    alert.className = `custom-alert ${type}`;
    alertMessage.textContent = message;
    
    // Configurar o ícone
    if (type === 'error') {
        alertIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'success') {
        alertIcon.className = 'fas fa-check-circle';
    }
    
    // Mostrar o alerta
    alert.style.display = 'flex';
    
    // Configurar o botão de fechar
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.onclick = () => {
        alert.classList.add('hide');
        setTimeout(() => {
            alert.style.display = 'none';
            alert.classList.remove('hide');
        }, 300);
    };
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        if (alert.style.display === 'flex') {
            alert.classList.add('hide');
            setTimeout(() => {
                alert.style.display = 'none';
                alert.classList.remove('hide');
            }, 300);
        }
    }, 5000);
}

// Função para mostrar mensagem de erro
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    
    if (element && errorElement) {
        element.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Função para limpar mensagem de erro
function clearError(elementId) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    
    if (element && errorElement) {
        element.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

// Função para validar o formulário de adição
function validarFormularioAdicao() {
    let isValid = true;
    const nomeInput = document.getElementById('nome');
    const corInput = document.getElementById('cor');
    const corHexInput = document.getElementById('cor-hex');
    
    if (!nomeInput || !corInput || !corHexInput) {
        console.error('Elementos do formulário não encontrados');
        return false;
    }
    
    const nome = nomeInput.value.trim();
    const cor = corInput.value;
    const corHex = corHexInput.value.trim();
    
    // Limpar erros anteriores
    clearError('nome');
    clearError('cor');
    clearError('cor-hex');
    
    // Validar nome
    if (!nome) {
        showError('nome', 'Por favor, preencha o nome do docente');
        isValid = false;
    } else if (nome.length < 3) {
        showError('nome', 'O nome deve ter pelo menos 3 caracteres');
        isValid = false;
    }
    
    // Validar cor
    if (!cor) {
        showError('cor', 'Por favor, selecione uma cor');
        isValid = false;
    }
    
    // Validar cor hexadecimal
    if (!corHex) {
        showError('cor-hex', 'Por favor, insira o código hexadecimal da cor');
        isValid = false;
    } else if (!corHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        showError('cor-hex', 'Código hexadecimal inválido');
        isValid = false;
    }
    
    return isValid;
}

// Função para salvar docente
async function salvarDocente() {
    try {
        // Validar formulário
        if (!validarFormularioAdicao()) {
            return;
        }

        const nomeInput = document.getElementById('nome');
        const corInput = document.getElementById('cor');
        
        if (!nomeInput || !corInput) {
            showAlert('Erro ao acessar os campos do formulário', 'error');
            return;
        }

        const nome = nomeInput.value.trim();
        const cor = corInput.value;

        // Desabilitar botão de salvar durante o processo
        const btnSalvar = document.getElementById('salvar-docente');
        if (btnSalvar) {
            btnSalvar.disabled = true;
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        }

        const novoDocente = {
            nome: nome,
            cor: cor
        };

        const result = await createDocente(novoDocente);
        if (result) {
            // Atualizar a lista de docentes após adicionar
            await carregarDados();
            // Fechar modal e mostrar mensagem
            fecharModalAdicionarDocente();
            showToast('Docente adicionado com sucesso!', 'success');
            // Limpar formulário
            limparFormularioDocente();
        } else {
            showToast('Erro ao adicionar docente. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar docente:', error);
        showToast('Erro ao adicionar docente. Por favor, tente novamente.', 'error');
    } finally {
        // Reabilitar botão de salvar
        const btnSalvar = document.getElementById('salvar-docente');
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = 'Salvar';
        }
    }
}

// Função para salvar edição
async function salvarEdicao() {
    try {
        const id = document.getElementById('edit-id').value;
        const nome = document.getElementById('edit-nome').value;
        const cor = document.getElementById('edit-cor').value;

        if (!nome || !cor) {
            showAlert('Por favor, preencha todos os campos.', 'error');
            return;
        }

        const docenteAtualizado = {
            id: parseInt(id),
            nome: nome,
            cor: cor
        };

        const result = await updateDocente(docenteAtualizado);
        if (result) {
            await carregarDados();
            fecharModalEditarDocente();
            showAlert('Docente atualizado com sucesso!', 'success');
        } else {
            showAlert('Erro ao atualizar docente. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar edição:', error);
        showAlert('Erro ao atualizar docente. Por favor, tente novamente.', 'error');
    }
}

// Função para deletar docente
async function deletarDocente(id) {
    try {
        const response = await deleteDocente(id);
        
        if (response.status === 200) {
            // Fechar o modal de deleção
            fecharModalConfirmarDelecao();
            
            // Remover o docente da lista local
            docentes = docentes.filter(d => d.id !== id);
            
            // Atualizar a interface
            renderDocentes();
            
            // Mostrar mensagem de sucesso usando o padrão do site
            showToast(response.mensagem, 'success');
            
            // Tentar atualizar os dados do servidor
            try {
                await carregarDados();
            } catch (error) {
                console.warn('Erro ao atualizar dados do servidor, mas a interface foi atualizada:', error);
            }
        } else {
            showToast('Erro ao excluir docente. Por favor, tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro ao deletar docente:', error);
        showToast('Erro ao excluir docente. Por favor, tente novamente.', 'error');
    }
}

// Função para sincronizar os inputs de cor
function sincronizarInputsCor(colorInput, hexInput) {
    colorInput.addEventListener('input', function() {
        hexInput.value = this.value.toUpperCase();
    });

    hexInput.addEventListener('input', function() {
        if (this.value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
            colorInput.value = this.value;
        }
    });
}

// Inicializar sincronização dos inputs de cor
document.addEventListener('DOMContentLoaded', function() {
    const colorInput = document.getElementById('cor');
    const hexInput = document.getElementById('cor-hex');
    const editColorInput = document.getElementById('edit-cor');
    const editHexInput = document.getElementById('edit-cor-hex');

    if (colorInput && hexInput) {
        sincronizarInputsCor(colorInput, hexInput);
    }
    if (editColorInput && editHexInput) {
        sincronizarInputsCor(editColorInput, editHexInput);
    }
});

// Exportar funções necessárias
window.editarDocente = editarDocente;
window.confirmarExclusao = confirmarExclusao;
window.salvarDocente = salvarDocente;
window.salvarEdicao = salvarEdicao; 
