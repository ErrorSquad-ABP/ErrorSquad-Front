// Importar funções da API
import { fetchGradeData, filtrarDocentes } from './fetchFunctions/fetchGradeGuest.js';
import { useState } from './useState.js';
import { CSSLoader } from './utils/cssLoader.js';

// URL base da API
const API_URL = 'https://gerenciamento-pedagogico-server.koyeb.app';

document.addEventListener('DOMContentLoaded', async function () {
    // 1. Carregar CSS primeiro
    const cssLoader = new CSSLoader();
    await cssLoader.loadGradeCSS();

    // Adicionar link para o CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/public/css/grade-horarios-guest.css';
    document.head.appendChild(link);

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
                    } else {
                        // Remover data-attributes se não houver período
                        cell.removeAttribute('data-id-periodo');
                        cell.removeAttribute('data-id-dia');
                        cell.removeAttribute('data-id-horario');
                        cell.innerHTML = '';
                        cell.classList.remove('celula-preenchida');
                    }
                }
            });
        });

        atualizarListaDocentes();

        // Salvar o estado após preencher a grade
        salvarEstadoGrade();
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
});

