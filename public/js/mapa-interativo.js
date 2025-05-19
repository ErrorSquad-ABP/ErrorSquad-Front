// Variáveis globais
let currentFloor = 0;
let selectedRoom = null;
let roomsData = {};
let searchTimeout = null;
let popupGlobalContainer = null;

// Carrega o mapa inicial quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadFloorMap(0);
    setupEventListeners();
    initializeSearch();
    criarOverlayPopup();
});

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
        
        // Adiciona eventos de clique para abrir o popup global
        mapContent.querySelectorAll('.sala, .biblioteca').forEach(el => {
            const popup = el.querySelector('.pop-up');
            if (popup) {
                el.onclick = e => {
                    e.stopPropagation();
                    abrirPopupGlobal(popup);
                };
            }
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
        // Térreo (andar-0.html)
        'deposito': {
            name: 'Depósito',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Manutenção'
        },
        'copa-e-reunioes': {
            name: 'Copa e Sala de Reuniões',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Restrita'
        },
        'sec-administrativa': {
            name: 'Secretaria Admin',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Restrita'
        },
        'sec-academica': {
            name: 'Secretaria Acadêmica',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Restrita'
        },
        'admin': {
            name: 'Salas Administrativas',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Restrita'
        },
        'sala-02': {
            name: 'Laboratório de Desenho e Topografia',
            disciplina: 'Topografia',
            docente: 'Prof. João Silva',
            curso: 'Engenharia Civil',
            nivel: 'Superior',
            status: 'Disponível'
        },
        'sala-04': {
            name: 'Laboratório de Química Ambiental',
            disciplina: 'Química Ambiental',
            docente: 'Profa. Ana Souza',
            curso: 'Engenharia Ambiental',
            nivel: 'Superior',
            status: 'Disponível'
        },
        'sala-01': {
            name: 'Laboratório de Análises Ambientais',
            disciplina: 'Análises Ambientais',
            docente: 'Prof. Carlos Mendes',
            curso: 'Engenharia Ambiental',
            nivel: 'Superior',
            status: 'Disponível'
        },
        'sala-03': {
            name: 'Laboratório de Microbiologia Ambiental',
            disciplina: 'Microbiologia',
            docente: 'Profa. Maria Clara',
            curso: 'Engenharia Ambiental',
            nivel: 'Superior',
            status: 'Disponível'
        },
        'lab-info-01': {
            name: 'Laboratório de Informática 01',
            disciplina: 'Desenvolvimento Web',
            docente: 'Prof. João Silva',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'lab-info-02': {
            name: 'Laboratório de Informática 02',
            disciplina: 'Banco de Dados',
            docente: 'Profa. Maria Santos',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'lab-info-03': {
            name: 'Laboratório de Informática 03',
            disciplina: 'Programação Mobile',
            docente: 'Prof. Carlos Oliveira',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'lab-info-04': {
            name: 'Laboratório de Informática 04',
            disciplina: 'Inteligência Artificial',
            docente: 'Prof. Roberto Santos',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'lab-info-05': {
            name: 'Laboratório de Informática 05',
            disciplina: 'Redes de Computadores',
            docente: 'Profa. Ana Lima',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'lab-info-06': {
            name: 'Laboratório de Informática 06',
            disciplina: 'Segurança da Informação',
            docente: 'Prof. Pedro Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Manutenção'
        },
        'biblioteca': {
            name: 'Biblioteca',
            disciplina: 'Área de Estudos',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Disponível'
        },
        'secretaria': {
            name: 'Secretaria Acadêmica',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: '-'
        },
        'coordenacao': {
            name: 'Coordenação',
            disciplina: '-',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: '-'
        },

        // Primeiro Andar (andar-1.svg)
        'sala-101': {
            name: 'Sala de Aula',
            disciplina: 'Cálculo',
            docente: 'Prof. Ricardo Alves',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Manutenção'
        },
        'sala-102': {
            name: 'Sala de Aula',
            disciplina: 'Inglês Técnico',
            docente: 'Profa. Sarah Johnson',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'sala-103': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-104': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-105': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-106': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-107': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-108': {
            name: 'Sala de Aula',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-110': {
            name: 'Sala Maker',
            disciplina: 'Gestão de Projetos',
            docente: 'Prof. Marcos Paulo',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'lab-hardware': {
            name: 'Laboratório de Hardware',
            disciplina: 'Arquitetura de Computadores',
            docente: 'Prof. Fernando Silva',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'lab-redes': {
            name: 'Laboratório de Redes',
            disciplina: 'Infraestrutura e Redes',
            docente: 'Profa. Carla Santos',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-professores': {
            name: 'Sala dos Professores',
            disciplina: 'Área dos Docentes',
            docente: '-',
            curso: '-',
            nivel: 'Docentes',
            status: 'Disponível'
        },

        // Segundo Andar (andar-2.svg)
        'sala-201': {
            name: 'Sala de Áudio e Vídeo',
            disciplina: 'Engenharia de Software',
            docente: 'Prof. Lucas Mendes',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-202': {
            name: 'Sala de Aula',
            disciplina: 'Matemática Discreta',
            docente: 'Profa. Patricia Lima',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        },
        'sala-203': {
            name: 'Laboratório Univesp',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-204': {
            name: 'Sala de Aula',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-205': {
            name: 'Laboratório de Informática',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-206': {
            name: 'Sala de Aula',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-207': {
            name: 'Laboratório de Informática',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-208': {
            name: 'Laboratório de Biologia',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-209': {
            name: 'Laboratório de Informática',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'sala-210': {
            name: 'Sala de Áudio e Vídeo',
            disciplina: 'Sistemas Operacionais',
            docente: 'Prof. Gabriel Costa',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Ocupada'
        },
        'auditorio': {
            name: 'Auditório',
            disciplina: 'Eventos e Palestras',
            docente: '-',
            curso: '-',
            nivel: '-',
            status: 'Disponível'
        },
        'lab-inovacao': {
            name: 'Laboratório de Inovação',
            disciplina: 'Projetos Interdisciplinares',
            docente: 'Prof. André Santos',
            curso: 'Desenvolvimento de Software Multiplataforma',
            nivel: 'Superior Tecnológico',
            status: 'Disponível'
        }
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

// Configuração dos eventos
function configurarEventos() {
    const floorButton = document.getElementById('floorButton');
    const floorDropdown = document.getElementById('floorDropdown');
    
    // Toggle do dropdown
    floorButton.addEventListener('click', () => {
        floorDropdown.classList.toggle('show');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!floorButton.contains(e.target) && !floorDropdown.contains(e.target)) {
            floorDropdown.classList.remove('show');
        }
    });

    // Eventos dos itens do dropdown
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const andar = e.target.dataset.floor;
            const texto = e.target.textContent;
            
            // Atualiza o texto do botão
            floorButton.innerHTML = `${texto}<i class="fas fa-chevron-down"></i>`;
            
            // Fecha o dropdown
            floorDropdown.classList.remove('show');
        });
    });
}

// Atualiza a visualização de uma sala específica
function updateRoomVisual(roomId) {
    const room = document.querySelector(`[data-room-id="${roomId}"]`);
    if (!room) return "Sala não encontrada";

    const details = getRoomDetails(roomId);
    console.log(roomId, details, room.querySelector(".status-badge"));
    
    // Remove classes antigas de status
    room.querySelector(".status-badge").classList.remove('status-disponivel', 'status-ocupada', 'status-manutencao', 'status-reservada', 'status-restrita');
    
    // Formata status
    const statusFormat = details.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Adiciona nova classe de status
    room.querySelector(".status-badge").classList.add(`status-${statusFormat}`);
    room.querySelector(".status-badge").textContent = details.status;

    room.querySelector(".nome-sala").textContent = details.name;
}

// Atualiza a visualização de todas as salas
function updateAllRoomsVisual() {
    const rooms = document.querySelectorAll('.sala');
    rooms.forEach(room => {
        updateRoomVisual(room.dataset.roomId);
    });
}

// Função auxiliar para obter informações da sala
function obterInformacoesSala(salaId) {
    // Aqui você implementará a lógica para buscar os dados da sala no backend
    // Por enquanto, retornamos dados de exemplo
    return {
        id: salaId,
        nome: 'Sala ' + salaId,
        tipo: 'laboratorio',
        capacidade: 30,
        professor: 'Prof. Silva',
        recursos: ['projetor', 'computadores'],
        ocupada: false
    };
}

function criarOverlayPopup() {
    if (!document.querySelector('.popup-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        document.body.appendChild(overlay);
        // Não fecha ao clicar no overlay
    }
}

function criarPopupGlobalContainer() {
    if (!document.getElementById('popup-global')) {
        popupGlobalContainer = document.createElement('div');
        popupGlobalContainer.id = 'popup-global';
        document.body.appendChild(popupGlobalContainer);
    } else {
        popupGlobalContainer = document.getElementById('popup-global');
    }
}

function abrirPopupGlobal(popupOriginal) {
    criarPopupGlobalContainer();
    fecharPopupGlobal();
    // Clona o conteúdo do popup da sala
    const popupClone = popupOriginal.cloneNode(true);
    popupClone.classList.add('centralizado');
    popupClone.style.display = 'flex';
    // Adiciona botão de fechar
    if (!popupClone.querySelector('.btn-fechar-popup')) {
        const btn = document.createElement('button');
        btn.className = 'btn-fechar-popup';
        btn.innerHTML = '&times;';
        btn.onclick = fecharPopupGlobal;
        popupClone.appendChild(btn);
    }
    popupGlobalContainer.innerHTML = '';
    popupGlobalContainer.appendChild(popupClone);
    document.querySelector('.popup-overlay').classList.add('ativo');
}

function fecharPopupGlobal() {
    criarPopupGlobalContainer();
    popupGlobalContainer.innerHTML = '';
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) overlay.classList.remove('ativo');
}

// Remover o listener global de clique fora
window._popupClickOutsideListenerAdded = false;
// (Se quiser garantir, pode remover o eventListener, mas como só adiciona se não existir, basta não usar mais) 