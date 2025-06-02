// Variáveis globais
let currentFloor = 0;
let roomsData = {};
let salasAndar = [];
let salasFiltradas;

let roomsDataResolve;
const roomsDataReady = new Promise((resolve) => {
  roomsDataResolve = resolve;
});

function createGate() {
    let open, promise;
    
    function closeGate() {
        // Fecha o portão: cria uma nova promise pendente
        promise = new Promise(resolve => open = resolve);
    }

    function openGate() {
        // Abre o portão: resolve a promise
        open?.();
    }

    async function waitGate() {
        // Espera até o portão estar aberto
        await promise;
    }

    // Fecha o portão ao iniciar
    closeGate();

    return { closeGate, openGate, waitGate };
}

const salasFiltradasGate = createGate();

// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

import {getSalasInfo} from './fetchFunctions/fetchMapa.js';
import { showToast } from './toast.js';

  // URL base da API
const API_URL = 'https://errorsquad-server.onrender.com';
const socket = io(API_URL);

function setupEventListeners() {
    // Seletor de andar
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
        if (dadosSala) {
            roomsData =  dadosSala;

            // Resolve indicando que as salas foram carregadas
            roomsDataResolve();
        } else {
            showErrorToast('Dados não encontrados na resposta da API');
        }
    } catch (error) {
        console.error('Erro ao carregar a grade:', error);
        showErrorToast('Erro ao carregar a grade de horários. Por favor, tente novamente mais tarde.');
    }
}

// Função para mostrar mensagem de erro
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
// CARREGAR ANDAR
async function loadFloorMap(floor) {
    currentFloor = floor;
    let displayName;
    salasAndar = [];
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
        
        const htmlAndar = await response.text();
        const mapContent = await document.getElementById('map-content');
        mapContent.innerHTML = htmlAndar;
        
        // Adiciona eventos de clique para abrir o modal
        mapContent.querySelectorAll('.sala').forEach(el => {
            if(el.getAttribute('data-room-id').slice(0,4) === 'sala') {

            const idSala = el.getAttribute('data-room-id');


            // Pega o ID de todas as salas do andar atual se for 'sala'

            salasAndar.push(idSala);
            getSalasFiltradas();
            atualizarSala(idSala);

            el.addEventListener('click', (e) => {
                if (idSala) {
                    if (salasFiltradas[idSala]){
                      abrirModal('modal', salasFiltradas[idSala]);
                    } else {
                        abrirModal('salaVazia', null);
                    }
                }
            });
            }
        });
    } catch (error) {
        console.error('Erro ao carregar mapa:', error);
    }
}

async function getSalasFiltradas(){
    await roomsDataReady;

    salasFiltradas = objetificar(filtrarHorario(filtrarDia(await filtroSalas())));

    salasFiltradasGate.openGate();
}

async function atualizarSala(idSala){
    await roomsDataReady;
    await salasFiltradasGate.waitGate();

    if(salasFiltradas[idSala] != undefined){
    


    const sala = document.querySelector(`[data-room-id="${idSala}"]`);

    sala.style.borderStyle = 'solid';
    sala.style.borderSize = '2px';
    sala.style.borderColor = salasFiltradas[idSala].cor_docente;
    sala.querySelector('.status-badge').classList.remove('status-disponivel');
    sala.querySelector('.status-badge').classList.add('status-ocupada');
    sala.querySelector('.status-badge').textContent = 'Ocupado'



    salasFiltradasGate.closeGate();
    }
}

async function getIdAmbiente(sala) {
    await roomsDataReady; // Espera os dados do mapa serem carregados
    try {
        if (sala.nome_ambiente == null) {
            throw new Error(`Sala ${sala} não encontrada nos dados.`);
        }
    } catch (error) {
        console.error(error.message);
        return 'Ambiente desconhecido';
    }
    // Se a sala existir, retorna o id do ambiente
    const ambiente = sala.nome_ambiente;
    return `sala-${ambiente.slice(-3).replace(/\s/g, "")}`;
}   

// Funções para controlar o modal
function abrirModal(modalId, dadosSala) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Preenche os dados da sala no modal
    if (dadosSala) {
        const extraido = extrairDadosSala(dadosSala)
        modalAtualizarTudo(extraido);
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Previne rolagem
}

function extrairDadosSala(sala) {
    let dadosSala = {};
    dadosSala.numero = sala.localizacao_ambiente.slice(5);
    dadosSala.name = sala.nome_ambiente;
    dadosSala.curso = sala.sigla_curso;
    dadosSala.docente = sala.nome_docente;
    dadosSala.disciplina = sala.nome_disciplina;
    dadosSala.horario = `${sala.hr_inicio.value.slice(0,5)} às ${sala.hr_fim.value.slice(0,5)}`;

    dadosSala.cor = sala.cor_docente;

    return dadosSala
}

function modalAtualizarTudo(dadosSala) {
        if (dadosSala) {
        modalAtualizarNumeroSala(dadosSala.numero || '');
        modalAtualizarNome(dadosSala.name || '');
        modalAtualizarCurso(dadosSala.curso || '');
        modalAtualizarProfessor(dadosSala.docente || '');
        modalAtualizarDisciplina(dadosSala.disciplina || '');
        modalAtualizarHorario(dadosSala.horario || '');
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    modalAtualizarTudo({})
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

// Exporta o PDF do andar atual em PAISAGEM, com cores fiéis
function setupPdfExport() {
    const btn = document.getElementById('exportar-pdf');
    if (!btn) return;
  
    btn.addEventListener('click', async () => {
        const elemento = document.getElementById('map-content');
        if (!elemento) return alert('Mapa não encontrado!');
    
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
    buscardadosSala();
    getSalasFiltradas();
}); 


async function filtroSalas() {
    await roomsDataReady; // Espera os dados do mapa serem carregados

    let filtrado = [];

    for (const id of salasAndar) {
        for (const room of roomsData) {
            if (room.nome_ambiente != null) {
                const roomId = await getIdAmbiente(room);
                if (roomId == id) {
                    filtrado.push(room);
                }
            }
        }
    }

    return filtrado; // se quiser retornar as salas filtradas
}

function filtrarDia(salas) {
    const diaAtual = new Date().getDay();
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    let filtradas = [];

    salas.forEach(sala => {
        if (sala.nome_dia == diasDaSemana[diaAtual]) {
            filtradas.push(sala);
        }
    });

    return filtradas
}

function converterParaMinutos(hora, minuto){
    return hora * 60 + minuto
}

function compararHorarios(horasInicio,minutosInicio,horasFim,minutosFim) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const toMinuto = converterParaMinutos(hours, minutes);

    const inicioToMinuto = converterParaMinutos(parseInt(horasInicio), parseInt(minutosInicio));

    const fimToMinuto = converterParaMinutos(parseInt(horasFim), parseInt(minutosFim));

    if (toMinuto >= inicioToMinuto && toMinuto <= fimToMinuto){
        return true
    }
}

function filtrarHorario(salas) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let filtradas = [];

    salas.forEach(sala => {
        if (compararHorarios(sala.hr_inicio.value.slice(0,2),sala.hr_inicio.value.slice(3,5),sala.hr_fim.value.slice(0,2),sala.hr_fim.value.slice(3,5))) {
            filtradas.push(sala);
        }
    });
    return filtradas
}

function objetificar(string) {
    let temp = {};
    for (let i = 0; i < string.length; i++) {
        const element = string[i];
        temp[element.localizacao_ambiente] = element;
    }
    return temp
}
      