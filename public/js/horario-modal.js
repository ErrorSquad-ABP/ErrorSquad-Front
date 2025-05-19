// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

document.addEventListener('DOMContentLoaded', function() {
    // Função para abrir o modal de horário
    window.abrirModalHorario = function() {
        const modal = document.getElementById('horarioModal');
        const materiaSelect = document.getElementById('horarioModalMateria');
        
        // Pegar o curso e nível atual
        const curso = document.querySelector('.grade-actions select:first-child').value;
        const nivel = document.querySelector('.grade-actions select:nth-child(2)').value;
        
        // Limpar e preencher o select de matérias
        materiaSelect.innerHTML = '<option value="">Selecione uma matéria</option>';
        
        // Pegar as disciplinas do curso/nível atual
        let disciplinas;
        switch(curso) {
            case 'DSM':
                disciplinas = nivel === '1' ? disciplinasDSM : 
                            nivel === '2' ? disciplinasDSM2 : disciplinasDSM3;
                break;
            case 'GEO':
                disciplinas = nivel === '1' ? disciplinasGEO : 
                            nivel === '2' ? disciplinasGEO2 : disciplinasGEO3;
                break;
            case 'MAR':
                disciplinas = nivel === '1' ? disciplinasMAR : 
                            nivel === '2' ? disciplinasMAR2 : disciplinasMAR3;
                break;
            default:
                disciplinas = disciplinasDSM;
        }

        // Preencher o select de matérias
        disciplinas.forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina.id;
            option.textContent = disciplina.nome;
            materiaSelect.appendChild(option);
        });

        // Preencher o select de horários
        const horarioSelect = document.getElementById('horarioModalHorario');
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        horarios.forEach((horario, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${horario.inicio} às ${horario.fim}`;
            horarioSelect.appendChild(option);
        });

        // Exibir o modal
        modal.classList.add('show');
    }

    // Função para fechar o modal
    function fecharModalHorario() {
        const modal = document.getElementById('horarioModal');
        modal.classList.remove('show');
    }

    // Evento para fechar o modal no botão de fechar
    document.querySelector('#horarioModal .close-modal').addEventListener('click', fecharModalHorario);

    // Evento para fechar o modal no botão cancelar
    document.querySelector('#horarioModal .btn-secondary').addEventListener('click', fecharModalHorario);

    // Evento para fechar o modal quando clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('horarioModal');
        if (event.target == modal) {
            fecharModalHorario();
        }
    });

    // Evento para associar matéria
    document.getElementById('associarMateriaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const materiaId = document.getElementById('horarioModalMateria').value;
        const dia = document.getElementById('horarioModalDia').value;
        const horarioIndex = document.getElementById('horarioModalHorario').value;

        if (!materiaId || !dia || horarioIndex === '') {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Pegar a célula correspondente na grade
        const diaIndex = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].indexOf(dia) + 1;
        const cell = document.querySelector(`.grade-table td[data-dia="${diaIndex}"][data-horario="${horarioIndex}"]`);

        if (cell) {
            // Verificar se já existe uma matéria neste horário
            if (cell.querySelector('.aula-cell')) {
                showToast('Já existe uma matéria associada a este horário.', 'error');
                return;
            }

            // Pegar a disciplina selecionada
            const disciplina = obterDisciplinaPorId(parseInt(materiaId));
            if (disciplina) {
                // Criar o elemento da aula
                const aulaCell = document.createElement('div');
                aulaCell.className = `aula-cell ${disciplina.tipo}`;
                aulaCell.setAttribute('draggable', 'true');
                aulaCell.setAttribute('data-cell-id', `${diaIndex}-${horarioIndex}`);
                
                // Criar o objeto de aula
                const aula = {
                    dia: diaIndex,
                    horario: parseInt(horarioIndex),
                    disciplina: disciplina
                };
                
                aulaCell.setAttribute('data-aula', JSON.stringify(aula));
                aulaCell.innerHTML = `
                    ${disciplina.nome}<br>
                    <small>${disciplina.professor}</small>
                `;

                // Adicionar a aula à célula
                cell.innerHTML = '';
                cell.appendChild(aulaCell);

                // Adicionar eventos de drag and drop
                aulaCell.addEventListener('dragstart', handleDragStart);
                aulaCell.addEventListener('dragend', handleDragEnd);
                cell.addEventListener('dragover', handleDragOver);
                cell.addEventListener('dragleave', handleDragLeave);
                cell.addEventListener('drop', handleDrop);

                // Registrar a associação
                registrarTrocaAula(aula);

                showToast('Matéria associada com sucesso!', 'success');
                fecharModalHorario();
            }
        }
    });
}); 