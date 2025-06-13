// Variáveis globais
let currentFloor = 0;
let roomsData = [];
let salasAndar = [];
let salasFiltradas = {};

// Sistema de promises para controle de fluxo
let roomsDataResolve;
const roomsDataReady = new Promise((resolve) => {
    roomsDataResolve = resolve;
});

// Imports
import { getSalasInfo } from './fetchFunctions/fetchMapa.js';
import { showToast } from './toast.js';

// Configuração da API
const API_URL = 'https://gerenciamento-pedagogico-server.koyeb.app';
const socket = io(API_URL);

// Inicializar IRONGATE se disponível
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// ==================== SETUP E INICIALIZAÇÃO ====================

function setupEventListeners() {
    const floorSelector = document.getElementById('floor-selector');
    if (floorSelector) {
        floorSelector.addEventListener('change', (e) => {
            loadFloorMap(e.target.value);
        });
    }
}

async function buscardadosSala() {
    try {
        const dadosSala = await getSalasInfo();
        if (dadosSala && Array.isArray(dadosSala)) {
            roomsData = dadosSala;
            roomsDataResolve();
            console.log('✅ Dados das salas carregados:', roomsData.length, 'salas');
        } else {
            throw new Error('Dados não encontrados na resposta da API');
        }
    } catch (error) {
        console.error('Erro ao carregar dados das salas:', error);
        showErrorToast('Erro ao carregar dados das salas. Tente novamente.');
    }
}

function showErrorToast(message) {
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
}

// ==================== CARREGAMENTO DO MAPA ====================

async function loadFloorMap(floor) {
    currentFloor = floor;
    
    // Limpa dados do andar anterior
    salasAndar = [];
    salasFiltradas = {};
    
    // Define nome do andar
    const displayNames = {
        '0': 'Térreo',
        '1': '1º andar',
        '2': '2º andar'
    };
    const displayName = displayNames[floor] || 'Térreo';
    
    try {
        // Carrega HTML do andar
        const response = await fetch(`../mapas/andar-${floor}.html`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o mapa do ${displayName}`);
        }
        
        const htmlAndar = await response.text();
        const mapContent = document.getElementById('map-content');
        mapContent.innerHTML = htmlAndar;
        
        // Coleta IDs das salas do andar
        coletarSalasDoAndar(mapContent);
        
        // Processa dados das salas
        await processarSalasDoAndar();
        
        // Configura eventos de clique
        configurarEventosClique(mapContent);
        
        console.log(`✅ Mapa do ${displayName} carregado com ${salasAndar.length} salas`);
        
    } catch (error) {
        console.error('Erro ao carregar mapa:', error);
        showErrorToast(`Erro ao carregar o mapa do ${displayName}`);
    }
}

function coletarSalasDoAndar(mapContent) {
    mapContent.querySelectorAll('.sala').forEach(el => {
        const roomId = el.getAttribute('data-room-id');
        if (roomId && roomId.startsWith('sala')) {
            salasAndar.push(roomId);
        }
    });
    
    console.log('🏢 Salas coletadas do andar:', salasAndar);
}

async function processarSalasDoAndar() {
    await roomsDataReady;
    
    // Filtra salas por andar, dia e horário
    const salasDoAndar = filtrarSalasPorAndar();
    const salasDoDia = filtrarSalasPorDia(salasDoAndar);
    const salasAtivas = filtrarSalasPorHorario(salasDoDia);
    
    // Converte para objeto com chave sendo o ID da sala
    salasFiltradas = objetificarSalas(salasAtivas);
    
    // Atualiza visual das salas
    atualizarVisualSalas();
    
    // Atualiza lista de docentes
    atualizarListaDocentes();
    
    console.log('📋 Salas processadas:', Object.keys(salasFiltradas).length);
}

function configurarEventosClique(mapContent) {
    mapContent.querySelectorAll('.sala').forEach(el => {
        const roomId = el.getAttribute('data-room-id');
        if (roomId && roomId.startsWith('sala')) {
            el.addEventListener('click', () => {
                if (salasFiltradas[roomId]) {
                    abrirModal('modal', salasFiltradas[roomId]);
                } else {
                    abrirModal('salaVazia', null);
                }
            });
        }
    });
}

// ==================== FILTROS ====================

function filtrarSalasPorAndar() {
    const salasFiltradas = [];
    
    for (const sala of roomsData) {
        if (!sala.nome_ambiente) continue;
        
        const salaId = getSalaIdFromAPI(sala);
        if (salasAndar.includes(salaId)) {
            salasFiltradas.push(sala);
        }
    }
    
    console.log('🔍 Salas filtradas por andar:', salasFiltradas.length);
    return salasFiltradas;
}

function getSalaIdFromAPI(sala) {
    // Mantém a lógica original: pega os últimos 3 caracteres do nome
    const ambiente = sala.nome_ambiente;
    const numeroSala = ambiente.slice(-3).replace(/\s/g, "");
    return `sala-${numeroSala}`;
}

function filtrarSalasPorDia(salas) {
    const hoje = new Date().getDay();
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaAtual = diasSemana[hoje];
    
    const salasFiltradas = salas.filter(sala => sala.nome_dia === diaAtual);
    
    console.log(`📅 Filtro por dia (${diaAtual}):`, salasFiltradas.length, 'salas');
    return salasFiltradas;
}

function filtrarSalasPorHorario(salas) {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    const minutosTotais = horaAtual * 60 + minutoAtual;
    
    const salasFiltradas = salas.filter(sala => {
        // Adapta para diferentes estruturas de dados
        const hrInicio = sala.hr_inicio?.value || sala.hr_inicio;
        const hrFim = sala.hr_fim?.value || sala.hr_fim;
        
        if (!hrInicio || !hrFim) {
            console.warn('⚠️ Horários não encontrados para sala:', sala);
            return false;
        }
        
        const horaInicio = parseInt(hrInicio.slice(0, 2));
        const minutoInicio = parseInt(hrInicio.slice(3, 5));
        const horaFim = parseInt(hrFim.slice(0, 2));
        const minutoFim = parseInt(hrFim.slice(3, 5));
        
        const inicioTotalMinutos = horaInicio * 60 + minutoInicio;
        const fimTotalMinutos = horaFim * 60 + minutoFim;
        
        const estaNoHorario = minutosTotais >= inicioTotalMinutos && minutosTotais <= fimTotalMinutos;
        
        if (estaNoHorario) {
            console.log(`✅ Sala ativa encontrada: ${hrInicio} às ${hrFim} (atual: ${horaAtual}:${minutoAtual.toString().padStart(2, '0')})`);
        }
        
        return estaNoHorario;
    });
    
    console.log(`⏰ Filtro por horário (${horaAtual}:${minutoAtual.toString().padStart(2, '0')}):`, salasFiltradas.length, 'salas');
    return salasFiltradas;
}

function objetificarSalas(salas) {
    const objeto = {};
    
    for (const sala of salas) {
        // Usa localizacao_ambiente como chave se disponível, senão usa o ID gerado
        const chave = sala.localizacao_ambiente || getSalaIdFromAPI(sala);
        objeto[chave] = sala;
    }
    
    return objeto;
}

// ==================== ATUALIZAÇÕES VISUAIS ====================

function atualizarVisualSalas() {
    document.querySelectorAll('.sala').forEach(el => {
        const roomId = el.getAttribute('data-room-id');
        const sala = salasFiltradas[roomId];
        
        if (sala) {
            // Aplica estilo para sala ocupada
            el.style.borderStyle = 'solid';
            el.style.borderWidth = '2px';
            el.style.borderColor = sala.cor_docente || '#ff0000';
            
            const statusBadge = el.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.classList.remove('status-disponivel');
                statusBadge.classList.add('status-ocupada');
                statusBadge.textContent = 'Ocupado';
            }
        } else {
            // Aplica estilo para sala disponível
            el.style.borderStyle = 'solid';
            el.style.borderWidth = '1px';
            el.style.borderColor = '#ccc';
            
            const statusBadge = el.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.classList.remove('status-ocupada');
                statusBadge.classList.add('status-disponivel');
                statusBadge.textContent = 'Disponível';
            }
        }
    });
}

function atualizarListaDocentes() {
    try {
        const docentesTable = document.querySelector('.docentes-table tbody');
        if (!docentesTable) {
            console.warn('Tabela de docentes não encontrada');
            return;
        }
        
        docentesTable.innerHTML = '';
        
        // Cria lista única de docentes (sem duplicatas)
        const docentes = new Set();
        
        Object.values(salasFiltradas).forEach(sala => {
            if (sala.nome_docente) {
                docentes.add(JSON.stringify({
                    nome: sala.nome_docente,
                    cor: sala.cor_docente || '#ffffff'
                }));
            }
        });
        
        // Adiciona docentes à tabela
        docentes.forEach(docenteStr => {
            const docente = JSON.parse(docenteStr);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="docente-item" style="background-color: ${docente.cor}; padding: 8px; border-radius: 4px;">
                        ${docente.nome}
                    </div>
                </td>
            `;
            docentesTable.appendChild(tr);
        });
        
        console.log('👨‍🏫 Lista de docentes atualizada:', docentes.size, 'docentes');
        
    } catch (error) {
        console.error('Erro ao atualizar lista de docentes:', error);
        const docentesTable = document.querySelector('.docentes-table tbody');
        if (docentesTable) {
            docentesTable.innerHTML = '<tr><td>Erro ao carregar lista de docentes</td></tr>';
        }
    }
}

// ==================== MODAL ====================

function abrirModal(modalId, dadosSala) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (dadosSala) {
        const dadosExtraidos = extrairDadosSala(dadosSala);
        preencherModal(dadosExtraidos);
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    limparModal();
    document.body.style.overflow = '';
}

function extrairDadosSala(sala) {
    // Adapta para diferentes estruturas de dados
    const hrInicio = sala.hr_inicio?.value || sala.hr_inicio;
    const hrFim = sala.hr_fim?.value || sala.hr_fim;
    
    return {
        numero: sala.localizacao_ambiente ? sala.localizacao_ambiente.slice(5) : '',
        nome: sala.nome_ambiente || '',
        curso: sala.sigla_curso || '',
        docente: sala.nome_docente || '',
        disciplina: sala.nome_disciplina || '',
        horario: hrInicio && hrFim 
            ? `${hrInicio.slice(0,5)} às ${hrFim.slice(0,5)}`
            : '',
        cor: sala.cor_docente || '#ffffff'
    };
}

function preencherModal(dados) {
    const modal = document.querySelector('#modal');
    if (!modal) return;
    
    const elementos = {
        '.modal-numero-sala': dados.numero,
        '.modal-nome-sala': dados.nome,
        '.modal-curso': dados.curso,
        '.modal-professor': dados.docente,
        '.modal-disciplina': dados.disciplina,
        '.modal-horario': dados.horario
    };
    
    Object.entries(elementos).forEach(([selector, valor]) => {
        const elemento = modal.querySelector(selector);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

function limparModal() {
    preencherModal({
        numero: '',
        nome: '',
        curso: '',
        docente: '',
        disciplina: '',
        horario: ''
    });
}

// ==================== EXPORTAÇÃO PDF ====================

function setupPdfExport() {
    const btn = document.getElementById('exportar-pdf');
    if (!btn) return;
    
    btn.addEventListener('click', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const elemento = document.getElementById('map-content');
        if (!elemento) {
            alert('Mapa não encontrado!');
            return;
        }
        
        try {
            // Gera canvas da imagem
            const canvas = await html2canvas(elemento, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Cria PDF em paisagem
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'landscape'
            });
            
            // Calcula dimensões
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - (margin * 2);
            
            const scaleWidth = maxWidth / canvas.width;
            const scaleHeight = maxHeight / canvas.height;
            const scale = Math.min(scaleWidth, scaleHeight);
            
            const imgWidth = canvas.width * scale;
            const imgHeight = canvas.height * scale;
            
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            
            // Adiciona imagem ao PDF
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            
            // Salva o arquivo
            pdf.save(`mapa-andar-${currentFloor}.pdf`);
            
            console.log('✅ PDF exportado com sucesso');
            
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF. Tente novamente.');
        }
    });
}

// ==================== EVENTOS DO MODAL ====================

function setupModalEvents() {
    // Fechar modal com botão X
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) fecharModal(modal.id);
        });
    });
    
    // Fechar modal com botão confirmar
    document.querySelectorAll('#modal-confirmar').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) fecharModal(modal.id);
        });
    });
    
    // Fechar modal clicando fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModal(this.id);
            }
        });
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                fecharModal(modal.id);
            });
        }
    });
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Mapa Interativo...');
    
    // Configuração inicial
    setupEventListeners();
    setupPdfExport();
    setupModalEvents();
    
    // Carrega dados e mapa inicial
    buscardadosSala();
    loadFloorMap('0');
    
    console.log('✅ Mapa Interativo inicializado');
});

// Exporta função para uso global (se necessário)
window.loadFloorMap = loadFloorMap;