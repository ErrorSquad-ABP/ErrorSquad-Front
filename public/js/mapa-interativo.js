// Variáveis globais
let currentFloor = 0;
let selectedRoom = null;
let roomsData = {};
let searchTimeout = null;
let popupGlobalContainer = null;

function setupEventListeners() {
    // Seletor de andar
    const floorSelector = document.getElementById('floor-selector');
    if (floorSelector) {
        floorSelector.addEventListener('change', (e) => {
            loadFloorMap(e.target.value);
        });
    }

    // Botão de busca
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Buscar sala...';
            searchInput.className = 'search-input';
            
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.appendChild(searchInput);
            
            const existingSearch = document.querySelector('.search-container');
            if (existingSearch) {
                existingSearch.remove();
            } else {
                document.querySelector('.mapa-actions').appendChild(searchContainer);
                searchInput.focus();
            }
        });
    }
}

function initializeSearch() {
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('search-input')) {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                highlightRooms(searchTerm);
            }, 300);
        }
    });
}

function highlightRooms(searchTerm) {
    const rooms = document.querySelectorAll('.sala');
    rooms.forEach(room => {
        const roomName = room.querySelector('.nome-sala').textContent.toLowerCase();
        const roomNumber = room.querySelector('.numero-sala').textContent.toLowerCase();
        
        if (roomName.includes(searchTerm) || roomNumber.includes(searchTerm)) {
            room.classList.add('highlight');
            room.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            room.classList.remove('highlight');
        }
    });
}

// CARREGAR ANDAR
async function loadFloorMap(floor) {
    currentFloor = floor;
    let displayName;

    switch(floor) {
        case '0':
            displayName = 'Térreo';
            break;
        case '1':
            displayName = '1º andar';
            break;
        case '2':
            displayName = '2º andar';
            break;
        default:
            floor = '0';
            displayName = 'Térreo';
    }

    try {
        const response = await fetch(`../adm/mapas/andar-${floor}.html`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o mapa do ${displayName}`);
        }
        
        const svgContent = await response.text();
        const mapContent = document.getElementById('map-content');
        if (!mapContent) {
            throw new Error('Elemento map-content não encontrado');
        }
        
        mapContent.innerHTML = svgContent;
        
        // Oculta todos os popups ao carregar o mapa
        mapContent.querySelectorAll('.pop-up').forEach(p => {
            p.style.display = 'none';
        });
        
        // Adiciona eventos de clique para abrir o modal
        mapContent.querySelectorAll('.sala, .biblioteca').forEach(el => {
            el.addEventListener('click', (e) => {
                const roomId = el.getAttribute('data-room-id');
                if (roomId) {
                    const roomDetails = getRoomDetails(roomId);
                    abrirModal('modal', roomDetails);
                }
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar mapa:', error);
    }
}

function selectRoomOnMap(roomElement) {
    if (!roomElement) return;
    
    // Remove seleção anterior
    const previousSelected = document.querySelector('.sala.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Seleciona nova sala
    roomElement.classList.add('selected');
    selectedRoom = roomElement.getAttribute('data-room-id');
    
    // Atualiza informações da sala
    updateRoomDetails(selectedRoom);
}

// Dados Mock para Teste
function getRoomDetails(roomId) {
    const mockData = {
        // ... (mantenha todo o objeto mockData existente)
    };
    
    return mockData[roomId] || {
        name: roomId ? roomId.replace(/-/g, ' ').toUpperCase() : 'Sala Desconhecida',
        disciplina: '-',
        docente: '-',
        curso: '-',
        nivel: '-',
        status: 'Disponível'
    };
}

// Funções para controlar o modal
function abrirModal(modalId, roomDetails) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Preenche os dados da sala no modal
    if (roomDetails) {
        modalAtualizarNumeroSala(roomDetails.numero || '');
        modalAtualizarNome(roomDetails.name || '');
        modalAtualizarCurso(roomDetails.curso || '');
        modalAtualizarProfessor(roomDetails.docente || '');
        modalAtualizarDisciplina(roomDetails.disciplina || '');
        modalAtualizarHorario(roomDetails.horario || '');
        modalAtualizarPericu(roomDetails.periculosidade || '');
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Previne rolagem
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restaura rolagem
}

// Modal atualizar infos
function modalAtualizarNumeroSala(numero) {
    const modal = document.querySelector('#modal');
    const numeroSala = modal.querySelector('.modal-numero-sala');
    numeroSala.textContent = numero;
}

function modalAtualizarNome(nome) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-nome-sala');
    item.textContent = nome;
}

function modalAtualizarCurso(curso) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-curso');
    item.textContent = curso;
}

function modalAtualizarProfessor(professor) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-professor');
    item.textContent = professor;
}

function modalAtualizarDisciplina(disciplina) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-disciplina');
    item.textContent = disciplina;
}

function modalAtualizarHorario(horario) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-horario');
    item.textContent = horario;
}

function modalAtualizarPericu(pericu) {
    const modal = document.querySelector('#modal');
    const item = modal.querySelector('.modal-periculosidade');
    item.textContent = pericu;
}




// Exporta o PDF do andar atual em PAISAGEM, com cores fiéis
function setupPdfExport() {
    const btn = document.getElementById('exportar-pdf');
    if (!btn) return;
  
    btn.addEventListener('click', async function exportMapa(event) {
        event.stopImmediatePropagation();
        const elemento = document.getElementById('map-content');
        if (!elemento) {
            return alert('Mapa não encontrado!');
  }
    
        // 1) Foto em canvas
        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        const imgData = canvas.toDataURL('image/png');
    
        // 2) PDF em landscape
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    
        // 3) Margens e área útil
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;  // mm
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
    
        // 4) Escala proporcional
        const scaleW = maxW  / canvas.width;
        const scaleH = maxH  / canvas.height;
        const scale  = Math.min(scaleW, scaleH);
        const imgW   = canvas.width  * scale;
        const imgH   = canvas.height * scale;
    
        // 5) Centraliza
        const x = (pageW - imgW) / 2;
        const y = (pageH - imgH) / 2;
    
        // 6) Insere sem esticar
        pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);
    
        // 7) Baixa
        pdf.save(`mapa-andar-${currentFloor}.pdf`);
    });
}


// Configuração dos eventos do modal
document.addEventListener('DOMContentLoaded', function() {
    // Fechar modal quando clicar no botão de fechar
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            fecharModal(modal.id);
        });
    });

    document.querySelectorAll('#modal-cancelar').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            fecharModal(modal.id);
        });
    });

    //BOTÃO DE CONFIRMAR LÓGICA AQUI
    document.querySelectorAll('#modal-confirmar').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            // Aqui você pode adicionar a lógica para confirmar a ação
        });
    });

    // Fechar modal quando clicar fora dele
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal(this.id);
            }
        });
    });

    // Fechar modal quando pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                fecharModal(modal.id);
            });
        }
    });

    // Inicialização
    loadFloorMap(0);
    setupEventListeners();
    setupPdfExport();
}); 