// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// Importar funções da API
import { fetchGradeData, getToken, getAdminId, uploadCSV, filtrarDocentes } from './fetchFunctions/fetchGrade.js';
import { useState } from './useState.js';
import swapProtection from './swapProtection.js';
import { CSSLoader } from './utils/cssLoader.js';

// URL base da API
const API_URL = 'https://gerenciamento-pedagogico-server.koyeb.app';
const socket = io(API_URL);

document.addEventListener('DOMContentLoaded', async function () {
    // 1. Carregar CSS primeiro
    const cssLoader = new CSSLoader();
    await cssLoader.loadGradeCSS();

    // 2. Inicializar swap protection
    swapProtection.init();

    // Adicionar link para o CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/public/css/grade-horarios.css';
    document.head.appendChild(link);

    // Função para verificar o token
    function verificarToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            // Decodificar o token JWT
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiracao = payload.exp * 1000; // Converter para milissegundos
            const agora = Date.now();
            const tempoRestante = expiracao - agora;

            // Se o token expirou ou está prestes a expirar (1 segundo)
            if (agora >= expiracao - 1000) {
                localStorage.clear(); // Limpa todo o localStorage
                window.location.href = '/login';
            }
        } catch (error) {
            localStorage.clear(); // Limpa todo o localStorage em caso de erro
            window.location.href = '/login';
        }
    }

    // Verificar o token a cada segundo
    const tokenInterval = setInterval(verificarToken, 1000);

    // Limpar o intervalo quando a página for fechada
    window.addEventListener('beforeunload', () => {
        clearInterval(tokenInterval);
    });

    // Verificar o token imediatamente ao carregar a página
    verificarToken();

    // Objeto para armazenar os dados da grade
    let gradeData = useState({
        dias: [],
        horarios: [],
        cursos: [],
        turnos: [],
        periodos: [],
        docente: []
    });

    // Função para mostrar mensagem de sucesso
    function showSuccessToast(message) {
        const toastContainer = document.querySelector('.toast-container');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
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

    // Função para mostrar mensagem de carregamento
    function showLoadingToast(message) {
        const toastContainer = document.querySelector('.toast-container');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast loading';
            toast.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>${message}</span>
            `;
            toastContainer.appendChild(toast);
            return toast;
        }
        return null;
    }

    // Função para salvar o estado da grade no localStorage
    function salvarEstadoGrade() {
        const gradeEstado = {
            filtros: recuperarFiltrosDoLocalStorage(),
            gradeData: gradeData
        };
        localStorage.setItem('gradeEstado', JSON.stringify(gradeEstado));
    }

    // Função para restaurar o estado da grade do localStorage
    function restaurarEstadoGrade() {
        const estadoSalvo = localStorage.getItem('gradeEstado');
        if (estadoSalvo) {
            const estado = JSON.parse(estadoSalvo);
            gradeData = estado.gradeData;
            return true;
        }
        return false;
    }

    // Função para buscar e processar os dados da grade
    async function buscarDadosGrade() {
        try {
            const dadosGrade = await fetchGradeData();
            if (dadosGrade) {
                // Atualizar o objeto gradeData com os dados recebidos
                gradeData = useState({
                    dias: dadosGrade.dias || [],
                    horarios: dadosGrade.horarios || [],
                    cursos: dadosGrade.cursos || [],
                    turnos: dadosGrade.turnos || [],
                    periodos: dadosGrade.periodos || [],
                    docente: dadosGrade.docente || []
                })
                atualizarFiltros();
                preencherGrade();
                atualizarListaDocentes();
            } else {
                showErrorToast('Dados não encontrados na resposta da API');
            }
        } catch (error) {
            console.error('Erro ao carregar a grade:', error);
            showErrorToast('Erro ao carregar a grade de horários. Por favor, tente novamente mais tarde.');
        }
    }

    // Função para salvar os filtros no localStorage
    function salvarFiltrosNoLocalStorage(curso, nivel, turno) {
        localStorage.setItem('gradeFiltros', JSON.stringify({
            curso: curso,
            nivel: nivel,
            turno: turno
        }));
    }

    // Função para recuperar os filtros do localStorage
    function recuperarFiltrosDoLocalStorage() {
        const filtrosSalvos = localStorage.getItem('gradeFiltros');
        if (filtrosSalvos) {
            return JSON.parse(filtrosSalvos);
        }
        // Valores padrão caso não exista nada salvo
        return {
            curso: 'DSM',
            nivel: '1',
            turno: 'noturno'
        };
    }

    // Função para atualizar os filtros com os dados da API
    function atualizarFiltros() {
        const cursoSelect = document.querySelector('.btn-secondary:nth-child(1)');
        const nivelSelect = document.querySelector('.btn-secondary:nth-child(2)');
        const turnoSelect = document.querySelector('.btn-secondary:nth-child(3)');

        const niveisPorCurso = {
            noturno: {
                GEO: [1, 3, 5, 6],
                MAR: [1, 2, 3],
                DSM: [1, 2, 3, 4, 5]
            },
            matutino: {
                GEO: [],
                MAR: [5, 6],
                DSM: []
            }
        };

        // Preencher select de cursos
        cursoSelect.innerHTML = '';
        if (gradeData.value.cursos && gradeData.value.cursos.length > 0) {
            gradeData.value.cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.sigla.toUpperCase();
                option.textContent = curso.nome;
                cursoSelect.appendChild(option);
            });
        } else {
            console.warn('Nenhum curso encontrado nos dados');
            cursoSelect.innerHTML = `
                <option value="DSM">DSM</option>
                <option value="GEO">GEO</option>
                <option value="MAR">MAR</option>
            `;
        }

        function atualizarTurnos(cursoAtual) {
            turnoSelect.innerHTML = '';

            if (gradeData.value.turnos && gradeData.value.turnos.length > 0) {
                gradeData.value.turnos.forEach(turno => {
                    const nomeTurno = turno.nome.toLowerCase();
                    const niveis = niveisPorCurso[nomeTurno]?.[cursoAtual];
                    if (niveis && niveis.length > 0) {
                        const option = document.createElement('option');
                        option.value = nomeTurno;
                        option.textContent = `Período ${turno.nome}`;
                        turnoSelect.appendChild(option);
                    }
                });
            }
        }

        function atualizarNiveis(cursoAtual, turnoAtual) {
            nivelSelect.innerHTML = '';

            const niveis = niveisPorCurso[turnoAtual]?.[cursoAtual];
            if (niveis && niveis.length > 0) {
                niveis.forEach(nivel => {
                    const option = document.createElement('option');
                    option.value = nivel;
                    option.textContent = `${nivel}º Nível`;
                    nivelSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum nível disponível';
                nivelSelect.appendChild(option);
            }
        }

        cursoSelect.addEventListener('change', () => {
            const cursoAtual = cursoSelect.value;

            atualizarTurnos(cursoAtual);

            // Seleciona primeiro turno disponível, evitando matutino para MAR
            let turnoSelecionado = '';
            for (let option of turnoSelect.options) {
                if (cursoAtual === 'MAR' && option.value === 'matutino') continue;
                turnoSelecionado = option.value;
                break;
            }

            turnoSelect.value = turnoSelecionado || turnoSelect.options[0]?.value || '';

            const turnoAtual = turnoSelect.value;
            atualizarNiveis(cursoAtual, turnoAtual);
            nivelSelect.value = nivelSelect.options[0]?.value || '';

            // ✅ Atualizar grade automaticamente
            salvarFiltrosNoLocalStorage(cursoSelect.value, nivelSelect.value, turnoSelect.value);
            preencherGrade();
            atualizarListaDocentes();
            salvarEstadoGrade();
        });

        turnoSelect.addEventListener('change', () => {
            const cursoAtual = cursoSelect.value;
            const turnoAtual = turnoSelect.value;
        
            atualizarNiveis(cursoAtual, turnoAtual);
            nivelSelect.value = nivelSelect.options[0]?.value || '';
        
            // ✅ Atualizar grade após trocar o turno
            salvarFiltrosNoLocalStorage(cursoSelect.value, nivelSelect.value, turnoSelect.value);
            preencherGrade();
            atualizarListaDocentes();
            salvarEstadoGrade();
        });

        // Inicialização com filtros salvos
        const filtros = recuperarFiltrosDoLocalStorage();

        cursoSelect.value = filtros.curso || cursoSelect.options[0]?.value;
        const cursoAtual = cursoSelect.value;

        atualizarTurnos(cursoAtual);

        // Se o turno salvo for inválido, seleciona o primeiro compatível (evita matutino para MAR)
        const turnoSalvoEhValido = [...turnoSelect.options].some(opt => opt.value === filtros.turno);
        let turnoAtual = '';
        if (turnoSalvoEhValido) {
            turnoAtual = filtros.turno;
        } else {
            for (let opt of turnoSelect.options) {
                if (cursoAtual === 'MAR' && opt.value === 'matutino') continue;
                turnoAtual = opt.value;
                break;
            }
        }
        turnoSelect.value = turnoAtual;

        atualizarNiveis(cursoAtual, turnoAtual);

        const nivelSalvoEhValido = [...nivelSelect.options].some(opt => opt.value === filtros.nivel);
        nivelSelect.value = nivelSalvoEhValido ? filtros.nivel : nivelSelect.options[0]?.value || '';
    }
    


    // Função para buscar ambientes
    async function getAmbientes() {
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('userId');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        try {
            const response = await fetch(`https://gerenciamento-pedagogico-server.koyeb.app/admin/${id}/ambientes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                throw new Error(`Erro ao buscar ambientes: ${response.status}`);
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Erro ao buscar ambientes:', error);
            throw error;
        }
    }

    // Função para criar o modal de edição
    function criarModalEdicao() {
        let modal = document.getElementById('modal-edicao');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-edicao';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Editar Célula</h3>
                    <form id="form-edicao">
                        <div>
                            <label>Disciplina:</label>
                            <select name="disciplina" class="form-control" required></select>
                        </div>
                        <div>
                            <label>Docente:</label>
                            <select name="docente" class="form-control" required></select>
                        </div>
                        <div>
                            <label>Ambiente:</label>
                            <select name="ambiente" class="form-control" required></select>
                        </div>
                        <div class="botoes-modal">
                            <button type="button" id="fechar-modal" class="btn-cancelar">Cancelar</button>
                            <button type="submit" class="btn-salvar">Salvar</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
        }
        return modal;
    }

    // Função para abrir o modal de edição
    async function abrirModalEdicao(cell, dadosAtuais = {}) {
        const modal = criarModalEdicao();
        modal.style.display = 'block';
        const form = modal.querySelector('#form-edicao');
        const selectDisciplina = form.querySelector('select[name="disciplina"]');
        const selectDocente = form.querySelector('select[name="docente"]');
        const selectAmbiente = form.querySelector('select[name="ambiente"]');

        // Limpar selects
        selectDisciplina.innerHTML = '<option value="">Selecione</option>';
        selectDocente.innerHTML = '<option value="">Selecione</option>';
        selectAmbiente.innerHTML = '<option value="">Selecione</option>';

        // Buscar e preencher opções
        try {
            const [{ getDisciplinas }, { getDocentes }] = await Promise.all([
                import('./fetchFunctions/fetchDisciplinas.js'),
                import('./fetchFunctions/fetchDocentes.js')
            ]);
            const disciplinasData = await getDisciplinas();
            const docentesData = await getDocentes();
            const ambientesData = await getAmbientes();
            console.log('Disciplinas recebidas:', disciplinasData);
            console.log('Docentes recebidos:', docentesData);
            console.log('Ambientes recebidos:', ambientesData);
            const disciplinasArray = disciplinasData?.data || disciplinasData || [];
            disciplinasArray.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.nome_disciplina;
                opt.textContent = d.nome_disciplina;
                if (d.nome_disciplina === dadosAtuais.nome_disciplina) opt.selected = true;
                selectDisciplina.appendChild(opt);
            });
            (docentesData || []).forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.nome;
                opt.textContent = d.nome;
                if (d.nome === dadosAtuais.nome_docente) opt.selected = true;
                selectDocente.appendChild(opt);
            });
            (ambientesData || []).forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.nome;
                opt.textContent = a.nome;
                if (a.nome === dadosAtuais.nome_ambiente) opt.selected = true;
                selectAmbiente.appendChild(opt);
            });
        } catch (err) {
            console.error('Erro ao carregar selects:', err);
        }

        // Ao submeter, envia PUT para o backend
        form.onsubmit = async function (e) {
            e.preventDefault();
            const id = cell.getAttribute('data-id-periodo');
            if (!id) {
                alert('ID do período não encontrado! Não é possível salvar nesta célula.');
                return;
            }

            // Desabilitar o botão de salvar e mostrar estado de loading
            const btnSalvar = form.querySelector('.btn-salvar');
            const btnOriginalText = btnSalvar.textContent;
            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Salvando...';
            btnSalvar.style.opacity = '0.7';
            btnSalvar.style.cursor = 'not-allowed';

            const userId = localStorage.getItem('userId');
            const payload = {
                id: id,
                nome_disciplina: selectDisciplina.value,
                nome_docente: selectDocente.value,
                nome_ambiente: selectAmbiente.value
            };
            console.log('Payload enviado:', payload);
            try {
                const token = localStorage.getItem('token');
                const resp = await fetch(`https://gerenciamento-pedagogico-server.koyeb.app/admin/${userId}/periodos`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) throw new Error('Erro ao salvar no banco');

                // Encontrar a cor do docente selecionado
                const docenteSelecionado = gradeData.value.docente.find(d =>
                    d.nome && d.nome.trim().toLowerCase() === selectDocente.value.trim().toLowerCase()
                );
                const corDocente = docenteSelecionado?.cor || '#ffffff';

                // Atualiza célula visualmente com a cor do docente
                cell.innerHTML = `
                    <div class="aula-item" style="background-color: ${corDocente}">
                        <strong>${selectDisciplina.value}</strong>
                        <p>${selectDocente.value}</p>
                        <small>${selectAmbiente.value}</small>
                    </div>
                `;
                modal.style.display = 'none';
                showSuccessToast('Período atualizado com sucesso!');
            } catch (err) {
                alert('Erro ao salvar no banco!');
                console.error(err);
            } finally {
                // Restaurar o botão ao estado original
                btnSalvar.disabled = false;
                btnSalvar.textContent = btnOriginalText;
                btnSalvar.style.opacity = '1';
                btnSalvar.style.cursor = 'pointer';
            }
        };
        // Botão cancelar
        modal.querySelector('#fechar-modal').onclick = function () {
            modal.style.display = 'none';
        };
    }

    // Função utilitária para remover duplicados de dias pelo nome
    function diasUnicos(dias) {
        const nomesVistos = new Set();
        return dias.filter(dia => {
            if (!dia.nome || nomesVistos.has(dia.nome)) return false;
            nomesVistos.add(dia.nome);
            return true;
        });
    }

    // Função utilitária para remover duplicados de horários pelo par hr_inicio/hr_fim
    function horariosUnicos(horarios) {
        const vistos = new Set();
        return horarios.filter(horario => {
            const inicio = horario.hr_inicio?.value || horario.hr_inicio;
            const fim = horario.hr_fim?.value || horario.hr_fim;
            const chave = `${inicio}-${fim}`;
            if (vistos.has(chave)) return false;
            vistos.add(chave);
            return true;
        });
    }

    function formatarHora(horaStr) {
        return horaStr?.slice(0, 5) || '';
    }

    // Função para montar dinamicamente a tabela de horários
    function montarTabelaGrade(diasGrade, horariosGrade) {
        const tbody = document.querySelector('.grade-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        horariosGrade.forEach((horario, horarioIndex) => {
            const tr = document.createElement('tr');
            // Primeira célula: horário
            const tdHorario = document.createElement('td');
            const hInicio = horario.hr_inicio?.value || horario.hr_inicio;
            const hFim = horario.hr_fim?.value || horario.hr_fim;
            tdHorario.textContent = `${formatarHora(hInicio)} às ${formatarHora(hFim)}`;
            tr.appendChild(tdHorario);
            // Células dos dias
            diasGrade.forEach((dia, diaIndex) => {
                const td = document.createElement('td');
                td.setAttribute('data-dia', diaIndex + 1);
                td.setAttribute('data-horario', horarioIndex);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // Função para filtrar e ordenar horários conforme o turno selecionado
    function filtrarHorariosPorTurno(horarios, turno) {
        let filtrados = horarios;
        if (turno === 'noturno') {
            filtrados = horarios.filter(horario => {
                const inicio = horario.hr_inicio?.value || horario.hr_inicio;
                return inicio >= '18:45:00' && inicio <= '23:05:00';
            });
        } else if (turno === 'matutino') {
            filtrados = horarios.filter(horario => {
                const inicio = horario.hr_inicio?.value || horario.hr_inicio;
                return inicio >= '07:30:00' && inicio <= '12:50:00';
            });
        }
        // Ordenar do mais cedo para o mais tarde
        filtrados.sort((a, b) => {
            const aInicio = a.hr_inicio?.value || a.hr_inicio;
            const bInicio = b.hr_inicio?.value || b.hr_inicio;
            return aInicio.localeCompare(bInicio);
        });
        return filtrados;
    }

    // Função para atualizar a lista de docentes
    function atualizarListaDocentes() {
        try {
            const cursoSelect = document.querySelector('.btn-secondary:nth-child(1)');
            const nivelSelect = document.querySelector('.btn-secondary:nth-child(2)');
            const turnoSelect = document.querySelector('.btn-secondary:nth-child(3)');

            if (!cursoSelect || !nivelSelect || !turnoSelect) {
                console.error('Elementos de seleção não encontrados');
                return;
            }

            const cursoSelecionado = cursoSelect.value;
            const nivelSelecionado = nivelSelect.value;
            const turnoSelecionado = turnoSelect.value.toLowerCase();

            // Verificar se gradeData existe e tem os dados necessários
            if (!gradeData || !gradeData.value.docente || !gradeData.value.periodos) {
                const docentesTable = document.querySelector('.docentes-table tbody');
                if (docentesTable) {
                    docentesTable.innerHTML = '<tr><td>Nenhum dado disponível</td></tr>';
                }
                return;
            }

            // Filtrar docentes usando a função do fetchGrade.js
            const docentesFiltrados = filtrarDocentes(
                gradeData.value.docente,
                gradeData.value.periodos,
                cursoSelecionado,
                nivelSelecionado,
                turnoSelecionado
            );

            const docentesTable = document.querySelector('.docentes-table tbody');
            if (!docentesTable) {
                console.error('Tabela de docentes não encontrada');
                return;
            }

            docentesTable.innerHTML = '';

            if (docentesFiltrados.length > 0) {
                docentesFiltrados.forEach(docente => {
                    const corDocente = (docente.cor && docente.cor.toLowerCase() !== '#ffffff') ? docente.cor : '#ffffff';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="docente-item" style="background-color: ${corDocente}">
                                ${docente.nome}
                            </div>
                        </td>
                    `;
                    docentesTable.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td>Nenhum docente encontrado para os filtros selecionados</td>';
                docentesTable.appendChild(tr);
            }
        } catch (error) {
            console.error('Erro ao atualizar lista de docentes:', error);
            const docentesTable = document.querySelector('.docentes-table tbody');
            if (docentesTable) {
                docentesTable.innerHTML = '<tr><td>Erro ao carregar lista de docentes</td></tr>';
            }
        }
    }

    // Função para preencher a grade com as aulas
    function preencherGrade() {
        const cursoSelecionado = document.querySelector('.btn-secondary:nth-child(1)').value.toUpperCase();
        const nivelSelecionado = document.querySelector('.btn-secondary:nth-child(2)').value;
        const turnoSelecionado = document.querySelector('.btn-secondary:nth-child(3)').value.toLowerCase();

        // Usar apenas dias e horários únicos
        const diasGrade = diasUnicos(gradeData.value.dias || []);
        // Ordenar os dias na ordem correta da semana
        const ordemDias = ['segunda', 'terca', 'terça', 'quarta', 'quinta', 'sexta', 'sabado', 'sábado', 'domingo'];
        diasGrade.sort((a, b) => {
            return ordemDias.indexOf(a.nome.toLowerCase()) - ordemDias.indexOf(b.nome.toLowerCase());
        });
        let horariosGrade = horariosUnicos(gradeData.value.horarios || []);

        // Filtrar horários conforme o turno selecionado
        horariosGrade = filtrarHorariosPorTurno(horariosGrade, turnoSelecionado);

        // Montar a tabela dinamicamente
        montarTabelaGrade(diasGrade, horariosGrade);

        // Filtrar períodos pelo curso, nível e turno selecionados
        const periodosFiltrados = gradeData.value.periodos.filter(periodo => {
            // Garantir que os valores sejam strings e estejam no formato correto
            const siglaCurso = String(periodo.sigla_curso || '').toUpperCase().trim();
            const nivelSemestre = String(periodo.nivel_semestre || '').trim();
            const nomeTurno = String(periodo.nome_turno || '').toLowerCase().trim();

            // Verificar cada condição separadamente para debug
            const cursoMatch = siglaCurso === cursoSelecionado;
            const nivelMatch = nivelSemestre === nivelSelecionado;
            const turnoMatch = nomeTurno === turnoSelecionado;

            return cursoMatch && nivelMatch && turnoMatch;
        });

        // Renderizar todas as células
        horariosGrade.forEach((horario, horarioIndex) => {
            diasGrade.forEach((dia, diaIndex) => {
                const cell = document.querySelector(`td[data-dia="${diaIndex + 1}"][data-horario="${horarioIndex}"]`);
                if (cell) {
                    // Procurar se existe um período para este dia/horário
                    const periodo = periodosFiltrados.find(periodo => {
                        const nomeDia = (periodo.nome_dia || '').toLowerCase();
                        const hrInicio = periodo.hr_inicio?.value || periodo.hr_inicio || '';
                        const hrFim = periodo.hr_fim?.value || periodo.hr_fim || '';
                        const hInicio = horario.hr_inicio?.value || horario.hr_inicio;
                        const hFim = horario.hr_fim?.value || horario.hr_fim;
                        const diaMatch = nomeDia === dia.nome.toLowerCase();
                        const horarioMatch = hrInicio === hInicio && hrFim === hFim;
                        return diaMatch && horarioMatch;
                    });

                    if (periodo) {
                        // Encontrar o docente para obter a cor (case-insensitive, trim)
                        const docente = gradeData.value.docente.find(d => d.nome && periodo.nome_docente && d.nome.trim().toLowerCase() === periodo.nome_docente.trim().toLowerCase());
                        const corDocente = docente?.cor || '#ffffff';

                        // Encontrar o ID do dia baseado no nome
                        const diaEncontrado = gradeData.value.dias.find(d => d.nome.toLowerCase() === periodo.nome_dia.toLowerCase());
                        const diaId = diaEncontrado ? diaEncontrado.id : null;

                        // Encontrar o ID do horário baseado no início e fim
                        const horarioEncontrado = gradeData.value.horarios.find(h => {
                            const hInicio = h.hr_inicio?.value || h.hr_inicio;
                            const hFim = h.hr_fim?.value || h.hr_fim;
                            const pInicio = periodo.hr_inicio?.value || periodo.hr_inicio;
                            const pFim = periodo.hr_fim?.value || periodo.hr_fim;
                            return hInicio === pInicio && hFim === pFim;
                        });
                        const horarioId = horarioEncontrado ? horarioEncontrado.id : null;

                        // Definir os data-attributes
                        cell.setAttribute('data-id-periodo', periodo.id);
                        cell.setAttribute('data-id-dia', diaId || '');
                        cell.setAttribute('data-id-horario', horarioId || '');

                        cell.innerHTML = `
                            <div class="aula-item" style="background-color: ${corDocente}">
                                <strong>${periodo.nome_disciplina || 'Disciplina não definida'}</strong>
                                <p>${periodo.nome_docente || 'Docente não definido'}</p>
                                <small>${periodo.nome_ambiente || 'Ambiente não definido'}</small>
                            </div>
                        `;
                        cell.classList.add('celula-preenchida');
                        cell.onclick = () => abrirModalEdicao(cell, periodo);
                    } else {
                        // Remover data-attributes se não houver período
                        cell.removeAttribute('data-id-periodo');
                        cell.removeAttribute('data-id-dia');
                        cell.removeAttribute('data-id-horario');
                        cell.innerHTML = '';
                        cell.classList.remove('celula-preenchida');
                        cell.onclick = () => abrirModalEdicao(cell);
                    }

                    // Drag and drop
                    cell.setAttribute('draggable', true);
                    cell.ondragstart = function (e) {
                        // Verificações de proteção
                        if (swapProtection.isSwapInProgress()) {
                            e.preventDefault();
                            showErrorToast('⚠️ Sistema bloqueado durante troca. Aguarde...');
                            return;
                        }

                        if (swapProtection.isCellLocked(cell)) {
                            e.preventDefault();
                            showErrorToast('⚠️ Esta célula está temporariamente bloqueada.');
                            return;
                        }

                        // Verificações originais
                        const periodoId = cell.getAttribute('data-id-periodo');
                        const diaId = cell.getAttribute('data-id-dia');
                        const horarioId = cell.getAttribute('data-id-horario');

                        if (!periodoId || !diaId || !horarioId) {
                            e.preventDefault();
                            showErrorToast('Célula não pode ser arrastada - IDs incompletos');
                            return;
                        }

                        // Código original continua
                        e.dataTransfer.setData('text/plain', '');
                        window.draggedCell = cell;
                        cell.classList.add('dragging');
                        document.body.style.cursor = 'grabbing';
                    };

                    cell.ondragend = function () {
                        cell.classList.remove('dragging');
                        document.body.style.cursor = 'default';
                    };

                    cell.ondragover = function (e) {
                        e.preventDefault();
                        if (!cell.classList.contains('drag-over')) {
                            cell.classList.add('drag-over');
                        }
                    };

                    cell.ondragleave = function () {
                        cell.classList.remove('drag-over');
                    };

                    cell.ondrop = async function (e) {
                        e.preventDefault();
                        cell.classList.remove('drag-over');
                        const origem = window.draggedCell;
                        const destino = cell;

                        if (!origem || !destino) {
                            return;
                        }

                        // *** VERIFICAÇÕES DE PROTEÇÃO ***
                        if (swapProtection.isSwapInProgress()) {
                            showErrorToast('⚠️ Operação de troca em andamento. Aguarde...');
                            return;
                        }

                        if (swapProtection.isCellLocked(origem) || swapProtection.isCellLocked(destino)) {
                            showErrorToast('⚠️ Uma das células está bloqueada para troca.');
                            return;
                        }

                        // Código original de verificação continua igual...
                        const origemPeriodoId = origem.getAttribute('data-id-periodo');
                        const origemDiaSemanaId = origem.getAttribute('data-id-dia');
                        const origemHorarioId = origem.getAttribute('data-id-horario');
                        const destinoPeriodoId = destino.getAttribute('data-id-periodo');
                        const destinoDiaSemanaId = destino.getAttribute('data-id-dia');
                        const destinoHorarioId = destino.getAttribute('data-id-horario');

                        // Verificações existentes
                        if (
                            origemPeriodoId === destinoPeriodoId &&
                            origemDiaSemanaId === destinoDiaSemanaId &&
                            origemHorarioId === destinoHorarioId
                        ) {
                            showErrorToast('Não é possível trocar uma célula por ela mesma.');
                            return;
                        }

                        if (
                            (!origemPeriodoId || !origemDiaSemanaId || !origemHorarioId) &&
                            (!destinoPeriodoId || !destinoDiaSemanaId || !destinoHorarioId)
                        ) {
                            showErrorToast('IDs de origem e destino inválidos para troca.');
                            return;
                        }

                        // *** INICIAR PROTEÇÃO DE SWAP ***
                        if (!swapProtection.startSwap(origem, destino)) {
                            showErrorToast('❌ Não foi possível iniciar a troca.');
                            return;
                        }

                        // Timeout de segurança
                        swapProtection.setSwapTimeout(15000);

                        const body = {
                            id_card1: Number(origemPeriodoId),
                            id_dia_card1: Number(origemDiaSemanaId),
                            id_horario_card1: Number(origemHorarioId),
                            id_card2: Number(destinoPeriodoId) || 0,
                            id_dia_card2: Number(destinoDiaSemanaId) || 0,
                            id_horario_card2: Number(destinoHorarioId) || 0
                        };

                        const loadingToast = showLoadingToast('🔄 Realizando troca...');

                        try {
                            const resp = await fetch(`${API_URL}/admin/${getAdminId()}/grade`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getToken()}`
                                },
                                body: JSON.stringify(body)
                            });

                            if (loadingToast) loadingToast.remove();

                            if (resp.ok) {
                                origem.classList.add('swap-animation');
                                destino.classList.add('swap-animation');
                                showSuccessToast('✅ Troca realizada com sucesso!');

                                setTimeout(() => {
                                    origem.classList.remove('swap-animation');
                                    destino.classList.remove('swap-animation');
                                }, 500);

                                // *** FINALIZAR SWAP COM SUCESSO ***
                                swapProtection.finishSwap(true);
                            } else {
                                let errorMessage = 'Erro ao trocar células!';
                                const responseData = await resp.json().catch(() => null);
                                if (responseData && responseData.mensagem) {
                                    errorMessage += ` ${responseData.mensagem}`;
                                }
                                showErrorToast(errorMessage);

                                // *** FINALIZAR SWAP COM ERRO ***
                                swapProtection.finishSwap(false);
                            }
                        } catch (err) {
                            if (loadingToast) loadingToast.remove();
                            showErrorToast('❌ Erro de conexão ao trocar células!');

                            // *** FINALIZAR SWAP COM ERRO ***
                            swapProtection.finishSwap(false);
                        }

                        window.draggedCell = null;
                    };
                }
            });
        });

        //webSocket event
        socket.on("grade_updated", (data) => {
            setTimeout(() => {
                const elemento1 = document.querySelector(`td[data-id-periodo="${data.card1.id}"]`);
                const elemento2 = document.querySelector(`td[data-id-periodo="${data.card2.id}"]`);

                if (elemento1 && elemento2) {
                    // Código original continua igual
                    const conteudoElemento1 = elemento1.innerHTML;
                    const conteudoElemento2 = elemento2.innerHTML;

                    elemento1.innerHTML = conteudoElemento2;
                    elemento2.innerHTML = conteudoElemento1;

                    elemento1.setAttribute('data-id-dia', data.card2.dia);
                    elemento1.setAttribute('data-id-periodo', data.card2.id);
                    elemento1.setAttribute('data-id-horario', data.card2.horario);

                    elemento2.setAttribute('data-id-dia', data.card1.dia);
                    elemento2.setAttribute('data-id-periodo', data.card1.id);
                    elemento2.setAttribute('data-id-horario', data.card1.horario);
                }
            }, 100);
        });

        // Atualizar a lista de docentes
        atualizarListaDocentes();

        // Salvar o estado após preencher a grade
        salvarEstadoGrade();
    }

    // Função para exportar grade para CSV
    async function exportarParaCSV() {
        try {
            const cursoSelecionado = document.querySelector('.btn-secondary:nth-child(1)').value;
            const nivelSelecionado = document.querySelector('.btn-secondary:nth-child(2)').value;
            const turnoSelecionado = document.querySelector('.btn-secondary:nth-child(3)').value;

            // Filtrar os períodos
            const periodosFiltrados = gradeData.value.periodos.filter(periodo =>
                periodo.sigla_curso === cursoSelecionado &&
                periodo.nivel_semestre === nivelSelecionado &&
                periodo.nome_turno.toLowerCase() === turnoSelecionado
            );

            // Criar cabeçalho do CSV
            let csv = 'Dia,Hora Início,Hora Fim,Disciplina,Docente,Ambiente\n';

            // Adicionar dados
            periodosFiltrados.forEach(periodo => {
                csv += `${periodo.nome_dia},${periodo.hr_inicio?.value || periodo.hr_inicio},${periodo.hr_fim?.value || periodo.hr_fim},${periodo.nome_disciplina},${periodo.nome_docente},${periodo.nome_ambiente}\n`;
            });

            // Criar blob e link para download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `grade_${cursoSelecionado}_${nivelSelecionado}_${turnoSelecionado}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            showErrorToast('Erro ao exportar grade para CSV');
        }
    }

    // Função para importar CSV
    async function importarCSV(file) {
        try {
            const result = await uploadCSV(file);
            if (result) {
                showErrorToast('CSV importado com sucesso!');
                // Recarregar os dados da grade
                await buscarDadosGrade();
            }
        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            showErrorToast('Erro ao importar CSV');
        }
    }

    // Adicionar botão de importar CSV ao lado do botão de exportar CSV
    const exportBtn = document.querySelector('.btn-primary');
    if (exportBtn) {
        // Criar botão de importar
        const importBtn = document.createElement('button');
        importBtn.id = 'btn-importar-csv';
        importBtn.className = 'btn btn-primary';
        importBtn.innerHTML = '<i class="fas fa-file-arrow-up"></i> Importar CSV';
        exportBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);

        // Criar input de arquivo oculto
        const inputCSV = document.createElement('input');
        inputCSV.type = 'file';
        inputCSV.id = 'input-csv';
        inputCSV.accept = '.csv';
        inputCSV.style.display = 'none';
        exportBtn.parentNode.insertBefore(inputCSV, importBtn.nextSibling);

        // Criar feedback visual
        const feedback = document.createElement('span');
        feedback.id = 'csv-feedback';
        feedback.style.marginLeft = '10px';
        feedback.style.fontWeight = '500';
        exportBtn.parentNode.insertBefore(feedback, inputCSV.nextSibling);

        // Evento do botão de importar
        importBtn.addEventListener('click', () => {
            inputCSV.value = '';
            inputCSV.click();
        });

        // Evento do input de arquivo
        inputCSV.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                feedback.innerHTML = '<span class="spinner"></span> Enviando...';
                feedback.style.color = '#b71c1c';
                importBtn.disabled = true;
                try {
                    await importarCSV(file);
                    feedback.innerHTML = 'CSV importado com sucesso!';
                    feedback.style.color = 'green';
                } catch (err) {
                    feedback.innerHTML = 'Erro ao importar CSV!';
                    feedback.style.color = 'red';
                }
                setTimeout(() => {
                    feedback.innerHTML = '';
                    importBtn.disabled = false;
                }, 4000);
            }
        });

        // Inicializar o dropdown de exportação após criar todos os botões
        initExportDropdown();
    }

    // Adicionar event listeners para os filtros
    document.querySelector('.btn-secondary:nth-child(1)').addEventListener('change', (e) => {
        const filtros = recuperarFiltrosDoLocalStorage();
        salvarFiltrosNoLocalStorage(e.target.value, filtros.nivel, filtros.turno);
        preencherGrade();
        atualizarListaDocentes();
        salvarEstadoGrade();
    });
    document.querySelector('.btn-secondary:nth-child(2)').addEventListener('change', (e) => {
        const filtros = recuperarFiltrosDoLocalStorage();
        salvarFiltrosNoLocalStorage(filtros.curso, e.target.value, filtros.turno);
        preencherGrade();
        atualizarListaDocentes();
        salvarEstadoGrade();
    });
    document.querySelector('.btn-secondary:nth-child(3)').addEventListener('change', (e) => {
        const filtros = recuperarFiltrosDoLocalStorage();
        salvarFiltrosNoLocalStorage(filtros.curso, filtros.nivel, e.target.value);
        preencherGrade();
        atualizarListaDocentes();
        salvarEstadoGrade();
    });

    // Adicionar evento para salvar o estado antes de fechar a página
    window.addEventListener('beforeunload', () => {
        salvarEstadoGrade();
    });

    // Adicionar evento para salvar a URL atual antes do reload
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('lastGradeUrl', window.location.href);
    });

    // Verificar se existe uma URL salva e redirecionar se necessário
    document.addEventListener('DOMContentLoaded', () => {
        const lastUrl = sessionStorage.getItem('lastGradeUrl');
        if (lastUrl && window.location.href !== lastUrl) {
            window.location.href = lastUrl;
        }
    });

    // Preencher a tabela de horários
    const tbody = document.querySelector('.grade-table tbody');
    gradeData.value.horarios.forEach((horario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horario.hr_inicio} às ${horario.hr_fim}</td>
            <td data-dia="1" data-horario="${index}"></td>
            <td data-dia="2" data-horario="${index}"></td>
            <td data-dia="3" data-horario="${index}"></td>
            <td data-dia="4" data-horario="${index}"></td>
            <td data-dia="5" data-horario="${index}"></td>
        `;
        tbody.appendChild(tr);
    });

    // Buscar dados iniciais
    buscarDadosGrade();

    // Inicializar o dropdown de exportação
    function initExportDropdown() {
        const exportDropdown = document.querySelector('.export-dropdown');
        const exportBtn = exportDropdown.querySelector('.export-btn');
        const exportOptions = exportDropdown.querySelector('.export-options');

        // Toggle do dropdown
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown.classList.toggle('active');
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!exportDropdown.contains(e.target)) {
                exportDropdown.classList.remove('active');
            }
        });

        // Eventos dos botões de exportação
        const exportButtons = exportDropdown.querySelectorAll('.export-option');
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const exportType = button.getAttribute('data-export');

                if (exportType === 'csv') {
                    exportarParaCSV();
                } else if (exportType === 'pdf') {
                    exportarParaPDF();
                }

                exportDropdown.classList.remove('active');
            });
        });
    }
});

function getAttrNum(cell, attr) {
    return cell && cell.hasAttribute(attr) ? Number(cell.getAttribute(attr)) : 0;
}


