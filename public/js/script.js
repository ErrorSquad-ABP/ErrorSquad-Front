// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

/**
 * Script para o Painel Administrativo da FATEC
 */
document.addEventListener("DOMContentLoaded", function() {
    // Cache de elementos DOM
    const DOM = {
        container: document.querySelector(".container"),
        sidebar: document.querySelector(".sidebar"),
        collapseBtn: document.getElementById("collapse-btn"),
        menuToggle: document.getElementById("toggle-menu"),
        submenuLinks: document.querySelectorAll(".has-submenu"),
        adminButtons: document.querySelectorAll(".admin-button"),
        entityContainer: document.getElementById("entity-container"),
        mapEditor: document.getElementById("map-editor"),
        entityTitle: document.getElementById("entity-title"),
        entityType: document.getElementById("entity-type"),
        entityList: document.getElementById("entity-list"),
        addEntityBtn: document.getElementById("add-entity"),
        searchInput: document.getElementById("search-entity"),
        formContainer: document.querySelector(".form-container"),
        entityForm: document.getElementById("entity-form"),
        breadcrumb: document.getElementById("current-section")
    };

    // Estado da aplicação
    const state = {
        currentEntity: "",
        currentEntityId: null,
        deletingEntityId: null,
        isCollapsed: false,
        mapEntity: null
    };

    // Dados simulados para demonstração
    const mockData = {
        docentes: [
            { id: 1, nome: "Carlos Silva", email: "carlos.silva@fatec.sp.gov.br", curso: "DSM", cor: "#E30613", disciplinas: ["Banco de Dados", "Engenharia de Software"] },
            { id: 2, nome: "Marina Santos", email: "marina.santos@fatec.sp.gov.br", curso: "GEO", cor: "#1a73e8", disciplinas: ["Geomática", "Sensoriamento Remoto"] },
            { id: 3, nome: "Rafael Pereira", email: "rafael.pereira@fatec.sp.gov.br", curso: "MAR", cor: "#009688", disciplinas: ["Navegação", "Meteorologia Marítima"] },
            { id: 4, nome: "Lucia Mendes", email: "lucia.mendes@fatec.sp.gov.br", curso: "DSM", cor: "#795548", disciplinas: ["Algoritmos", "Estrutura de Dados"] }
        ],
        semestres: [
            { id: 1, ano: 2025, periodo: 1, inicio: "2025-02-10", fim: "2025-07-05" },
            { id: 2, ano: 2025, periodo: 2, inicio: "2025-08-05", fim: "2025-12-15" }
        ],
        salas: [
            { id: 1, nome: "Lab 01", tipo: "lab", capacidade: 30, localizacao: "Bloco B, Térreo", recursos: ["Projetor", "Computadores"] },
            { id: 2, nome: "Lab 02", tipo: "lab", capacidade: 30, localizacao: "Bloco B, Térreo", recursos: ["Projetor", "Computadores"] },
            { id: 3, nome: "Sala 101", tipo: "sala", capacidade: 50, localizacao: "Bloco A, 1º Andar", recursos: ["Projetor"] },
            { id: 4, nome: "Auditório", tipo: "auditorio", capacidade: 120, localizacao: "Bloco C, Térreo", recursos: ["Projetor", "Sistema de Som", "Ar-condicionado"] }
        ],
        disciplinas: [
            { id: 1, nome: "Banco de Dados", curso: "DSM", semestre: 3, aulas: 4, cor: "#E30613" },
            { id: 2, nome: "Engenharia de Software", curso: "DSM", semestre: 4, aulas: 4, cor: "#1a73e8" },
            { id: 3, nome: "Geomática", curso: "GEO", semestre: 2, aulas: 4, cor: "#009688" }
        ],
        cursos: [
            { id: 1, nome: "Desenvolvimento de Software Multiplataforma", sigla: "DSM", semestres: 6, coordenador: "Carlos Eduardo" },
            { id: 2, nome: "Geoprocessamento", sigla: "GEO", semestres: 6, coordenador: "Ana Maria Souza" },
            { id: 3, nome: "Meio Ambiente e Recursos Hídricos", sigla: "MAR", semestres: 6, coordenador: "Roberto Mendes" }
        ]
    };

    // Funções de utilidade
    const utils = {
        formatDate: (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
        },
        
        sanitizeHTML: (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },
        
        validateForm: (formData) => {
            const errors = [];
            // Implementar validação específica para cada tipo de entidade
            return errors;
        }
    };

    // Gerenciamento de UI
    const UI = {
        updateBreadcrumb: (text) => {
            if (DOM.breadcrumb) {
                DOM.breadcrumb.textContent = text;
            }
        },
        
        toggleLoading: (show) => {
            const loader = document.querySelector('.loader');
            if (loader) {
                loader.style.display = show ? 'flex' : 'none';
            }
        }
    };

    // Gerenciamento de dados
    const DataManager = {
        getEntity: (entityName, id) => {
            return mockData[entityName]?.find(item => item.id === id);
        },
        
        updateEntity: (entityName, id, data) => {
            const index = mockData[entityName]?.findIndex(item => item.id === id);
            if (index !== -1) {
                mockData[entityName][index] = { ...mockData[entityName][index], ...data };
                return true;
            }
            return false;
        },
        
        deleteEntity: (entityName, id) => {
            const index = mockData[entityName]?.findIndex(item => item.id === id);
            if (index !== -1) {
                mockData[entityName].splice(index, 1);
                return true;
            }
            return false;
        }
    };

    // Event Handlers
    const EventHandlers = {
        handleEdit: (entityId) => {
            state.currentEntityId = entityId;
            const entity = DataManager.getEntity(state.currentEntity, entityId);
            
            if (entity) {
                DOM.formContainer.classList.add('active');
                createEntityForm(true);
                console.error('Erro ao editar:', utils.sanitizeHTML(entity.nome));
            }
        },
        
        handleDelete: (entityId) => {
            const entity = DataManager.getEntity(state.currentEntity, entityId);
            
            if (entity) {
                const confirmDelete = confirm(`Tem certeza que deseja excluir ${utils.sanitizeHTML(entity.nome)}?`);
                if (confirmDelete) {
                    UI.toggleLoading(true);
                    try {
                        if (DataManager.deleteEntity(state.currentEntity, entityId)) {
                            showEntityList(state.currentEntity);
                            console.warn('Item excluído com sucesso');
                        }
                    } catch (error) {
                        console.error('Erro ao excluir item');
                    } finally {
                        UI.toggleLoading(false);
                    }
                }
            }
        }
    };

    // Função para inicializar o estado da sidebar (verificar localStorage)
    function initSidebarState() {
        state.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (state.isCollapsed) {
            DOM.container.classList.add('collapsed');
        }
    }
    
    // Toggle do colapso da sidebar
    if (DOM.collapseBtn) {
        DOM.collapseBtn.addEventListener("click", function() {
            state.isCollapsed = !state.isCollapsed;
            DOM.container.classList.toggle("collapsed", state.isCollapsed);
            localStorage.setItem('sidebarCollapsed', state.isCollapsed);
        });
    }
    
    // Toggle do menu lateral em dispositivos móveis
    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener("click", function() {
            DOM.sidebar.classList.toggle("active");
        });
    }
    
    // Fechar sidebar ao clicar fora dela em dispositivos móveis
    document.addEventListener("click", function(e) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && DOM.sidebar.classList.contains("active") && 
            !e.target.closest(".sidebar") && !e.target.closest(".menu-toggle")) {
            DOM.sidebar.classList.remove("active");
        }
    });
    
    // Toggle dos submenus
    if (DOM.submenuLinks) {
        DOM.submenuLinks.forEach(link => {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                this.classList.toggle("open");
            });
        });
    }
    
    // Adicionar evento de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Limpar dados do localStorage
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('senha');
            localStorage.removeItem('id');
            
            // Redirecionar para a página de login
            window.location.href = '/login';
        });
    }
    
    // Navegação da sidebar
    document.querySelectorAll('.sidebar-item a[data-protected-link]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
           
            // Remove a classe active de todos os links
            document.querySelectorAll('.sidebar-item a').forEach(item => item.classList.remove('active'));
            
            // Adiciona a classe active ao link clicado
            this.classList.add('active');
            
            // Navega para a página correspondente
            const page = this.getAttribute('data-page');
            if (page) {
                window.location.href = page;
            }
            
            // Fecha o menu móvel
            if (window.innerWidth <= 768) {
                DOM.sidebar.classList.remove("active");
            }
        });
    });
    
    // Manipulação dos botões administrativos
    if (DOM.adminButtons) {
        DOM.adminButtons.forEach(button => {
            button.addEventListener("click", function() {
                const entityName = this.getAttribute("data-entity");
                
                // Adicionando efeito de clique
                this.classList.add('clicked');
                setTimeout(() => this.classList.remove('clicked'), 200);
                
                if (entityName === 'mapas' && DOM.mapEditor) {
                    DOM.entityContainer.classList.remove('active');
                    DOM.mapEditor.classList.add('active');
                    UI.updateBreadcrumb('Editor de Mapas');
                } else if (DOM.entityContainer) {
                    showEntityList(entityName);
                    UI.updateBreadcrumb(entityName.charAt(0).toUpperCase() + entityName.slice(1));
                    if (DOM.mapEditor) DOM.mapEditor.classList.remove('active');
                }
            });
        });
    }
    
    // Função para exibir a lista de entidades
    function showEntityList(entityName) {
        if (!DOM.entityContainer || !DOM.entityTitle || !DOM.entityType || !DOM.entityList) return;
        
        state.currentEntity = entityName;
        DOM.entityContainer.classList.add("active");
        
        // Atualizar acessos recentes
        updateRecentAccess(entityName);
        
        // Atualizar o título e ícone
        let icon = 'list';
        DOM.entityType.textContent = entityName.charAt(0).toUpperCase() + entityName.slice(1);
        
        // Definir ícone baseado na entidade
        switch(entityName) {
            case 'docentes': icon = 'chalkboard-teacher'; break;
            case 'semestres': icon = 'calendar-alt'; break;
            case 'salas': icon = 'door-open'; break;
            case 'disciplinas': icon = 'book'; break;
            case 'cursos': icon = 'graduation-cap'; break;
        }
        
        DOM.entityTitle.innerHTML = `<i class="fas fa-${icon}"></i> Gerenciar <span id="entity-type"> ${DOM.entityType.textContent}</span>`;
        
        // Limpar a lista atual
        DOM.entityList.innerHTML = "";
        
        // Renderizar os cards com base no tipo de entidade
        if (mockData[entityName]) {
            mockData[entityName].forEach(item => {
                const card = createEntityCard(item);
                DOM.entityList.appendChild(card);
            });
        }
        
        // Configurar o input de busca
        if (DOM.searchInput) {
            DOM.searchInput.placeholder = `Buscar ${DOM.entityType.textContent.toLowerCase()}...`;
        }
        
        // Adicionar animação de entrada aos cards
        setTimeout(() => {
            const cards = DOM.entityList.querySelectorAll('.entity-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50 * index);
            });
        }, 100);
    }
    
    // Função para criar um card de entidade
    function createEntityCard(entity) {
        const card = document.createElement("div");
        card.className = "entity-card";
        card.dataset.id = entity.id;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        let cardContent = "";
        let iconClass = "";
        let showActions = true;
        let showAddButton = true;
        let showEditButton = true;
        let showDeleteButton = true;
        let showImportButton = false;
        
        // Controle de botões baseado no tipo de entidade
        switch (state.currentEntity) {
            case 'adm':
                showActions = false;
                break;
            case 'semestres':
                showAddButton = false;
                showDeleteButton = false;
                break;
            case 'docentes':
                showImportButton = true;
                break;
        }
        
        // Construir o conteúdo do card com base no tipo de entidade
        switch (state.currentEntity) {
            case "docentes":
                iconClass = "fas fa-chalkboard-teacher";
                cardContent = `
                    <div class="entity-card-header">
                        <div class="entity-color" style="background-color: ${entity.cor}"></div>
                        <h4 class="entity-title">${entity.nome}</h4>
                    </div>
                    <div class="entity-details">
                        <div class="entity-detail">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${entity.email}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Curso</span>
                            <span class="detail-value">${entity.curso}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Disciplinas</span>
                            <span class="detail-value">${entity.disciplinas.join(", ")}</span>
                        </div>
                    </div>
                `;
                break;
            
            case "semestres":
                iconClass = "fas fa-calendar-alt";
                const status = new Date(entity.inicio) > new Date() ? 
                    '<span class="badge badge-info">Futuro</span>' : 
                    (new Date(entity.fim) < new Date() ? 
                        '<span class="badge badge-warning">Encerrado</span>' : 
                        '<span class="badge badge-success">Atual</span>');
                        
                cardContent = `
                    <div class="entity-card-header">
                        <h4 class="entity-title">${entity.ano}.${entity.periodo} ${status}</h4>
                    </div>
                    <div class="entity-details">
                        <div class="entity-detail">
                            <span class="detail-label">Período</span>
                            <span class="detail-value">${entity.periodo == 1 ? "1º Semestre" : "2º Semestre"}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Início</span>
                            <span class="detail-value">${utils.formatDate(entity.inicio)}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Fim</span>
                            <span class="detail-value">${utils.formatDate(entity.fim)}</span>
                        </div>
                    </div>
                `;
                break;
            
            case "salas":
                iconClass = "fas fa-door-open";
                const tipoSala = {
                    lab: "Laboratório",
                    sala: "Sala de Aula",
                    auditorio: "Auditório"
                };
                
                cardContent = `
                    <div class="entity-card-header">
                        <h4 class="entity-title">${entity.nome}</h4>
                    </div>
                    <div class="entity-details">
                        <div class="entity-detail">
                            <span class="detail-label">Tipo</span>
                            <span class="detail-value">${tipoSala[entity.tipo] || entity.tipo}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Capacidade</span>
                            <span class="detail-value">${entity.capacidade} lugares</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Localização</span>
                            <span class="detail-value">${entity.localizacao}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Recursos</span>
                            <span class="detail-value">${entity.recursos.join(", ")}</span>
                        </div>
                    </div>
                `;
                break;
                
            case "disciplinas":
                iconClass = "fas fa-book";
                cardContent = `
                    <div class="entity-card-header">
                        <div class="entity-color" style="background-color: ${entity.cor}"></div>
                        <h4 class="entity-title">${entity.nome}</h4>
                    </div>
                    <div class="entity-details">
                        <div class="entity-detail">
                            <span class="detail-label">Curso</span>
                            <span class="detail-value">${entity.curso}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Semestre</span>
                            <span class="detail-value">${entity.semestre}º Semestre</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Aulas Semanais</span>
                            <span class="detail-value">${entity.aulas}</span>
                        </div>
                    </div>
                `;
                break;
                
            case "cursos":
                iconClass = "fas fa-graduation-cap";
                cardContent = `
                    <div class="entity-card-header">
                        <h4 class="entity-title">${entity.nome}</h4>
                    </div>
                    <div class="entity-details">
                        <div class="entity-detail">
                            <span class="detail-label">Sigla</span>
                            <span class="detail-value">${entity.sigla}</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Duração</span>
                            <span class="detail-value">${entity.semestres} semestres</span>
                        </div>
                        <div class="entity-detail">
                            <span class="detail-label">Coordenador</span>
                            <span class="detail-value">${entity.coordenador}</span>
                        </div>
                    </div>
                `;
                break;
        }
        
        // Adicionar ações (editar/excluir) ao card se permitido
        if (showActions) {
            let actionsHtml = '<div class="entity-actions">';
            
            // Botão de importar CSV (apenas para docentes)
            if (showImportButton) {
                actionsHtml += `
                    <button class="btn btn-icon btn-import" title="Importar CSV">
                        <i class="fas fa-file-import"></i>
                    </button>`;
            }
            
            // Botão de adicionar
            if (showAddButton) {
                actionsHtml += `
                    <button class="btn btn-icon btn-add" title="Adicionar">
                        <i class="fas fa-plus"></i>
                    </button>`;
            }
            
            // Botão de editar
            if (showEditButton) {
                actionsHtml += `
                    <button class="btn btn-icon btn-edit" data-id="${entity.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>`;
            }
            
            // Botão de excluir
            if (showDeleteButton) {
                actionsHtml += `
                    <button class="btn btn-icon btn-delete" data-id="${entity.id}" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>`;
            }
            
            actionsHtml += '</div>';
            cardContent += actionsHtml;
        }
        
        card.innerHTML = cardContent;
        
        // Adicionar eventos aos botões
        if (showActions) {
            // Evento de importar CSV
            const importBtn = card.querySelector(".btn-import");
            if (importBtn) {
                importBtn.addEventListener("click", function() {
                    handleImportCSV();
                });
            }
            
            // Evento de adicionar
            const addBtn = card.querySelector(".btn-add");
            if (addBtn) {
                addBtn.addEventListener("click", function() {
                    handleAdd();
                });
            }
            
            // Evento de editar
            const editBtn = card.querySelector(".btn-edit");
            if (editBtn) {
                editBtn.addEventListener("click", function() {
                    const entityId = parseInt(this.dataset.id);
                    EventHandlers.handleEdit(entityId);
                });
            }
            
            // Evento de excluir
            const deleteBtn = card.querySelector(".btn-delete");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", function() {
                    const entityId = parseInt(this.dataset.id);
                    EventHandlers.handleDelete(entityId);
                });
            }
        }
        
        return card;
    }
    
    // Função para criar o formulário dinâmico baseado no tipo de entidade
    function createEntityForm(isEdit) {
        if (!DOM.formContainer) return;
        
        let formHTML = "";
        let entity = null;
        
        if (isEdit && state.currentEntityId) {
            entity = DataManager.getEntity(state.currentEntity, state.currentEntityId);
        }
        
        switch (state.currentEntity) {
            case "docentes":
                formHTML = `
                    <div class="form-group">
                        <label for="nome">Nome completo</label>
                        <input type="text" id="nome" name="nome" placeholder="Nome do docente" 
                               value="${entity ? entity.nome : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email institucional</label>
                        <input type="email" id="email" name="email" placeholder="email@fatec.sp.gov.br"
                               value="${entity ? entity.email : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="curso">Curso Principal</label>
                        <select id="curso" name="curso" required>
                            <option value="">Selecione o curso</option>
                            <option value="DSM" ${entity && entity.curso === "DSM" ? "selected" : ""}>Desenvolvimento de Software Multiplataforma</option>
                            <option value="GEO" ${entity && entity.curso === "GEO" ? "selected" : ""}>Geoprocessamento</option>
                            <option value="MAR" ${entity && entity.curso === "MAR" ? "selected" : ""}>Meio Ambiente e Recursos Hídricos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="cor">Cor de identificação</label>
                        <input type="color" id="cor" name="cor" value="${entity ? entity.cor : "#E30613"}">
                    </div>
                `;
                break;
                
            case "semestres":
                formHTML = `
                    <div class="form-group">
                        <label for="ano">Ano</label>
                        <input type="number" id="ano" name="ano" min="2020" max="2100" placeholder="Ex: 2025"
                               value="${entity ? entity.ano : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="periodo">Período</label>
                        <select id="periodo" name="periodo" required>
                            <option value="">Selecione o período</option>
                            <option value="1" ${entity && entity.periodo === 1 ? "selected" : ""}>1º Semestre</option>
                            <option value="2" ${entity && entity.periodo === 2 ? "selected" : ""}>2º Semestre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="inicio">Data de início</label>
                        <input type="date" id="inicio" name="inicio" value="${entity ? entity.inicio : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="fim">Data de término</label>
                        <input type="date" id="fim" name="fim" value="${entity ? entity.fim : ""}" required>
                    </div>
                `;
                break;
                
            case "salas":
                formHTML = `
                    <div class="form-group">
                        <label for="nome">Nome/Número da sala</label>
                        <input type="text" id="nome" name="nome" placeholder="Ex: Lab 01, Sala 101"
                               value="${entity ? entity.nome : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="tipo">Tipo</label>
                        <select id="tipo" name="tipo" required>
                            <option value="">Selecione o tipo</option>
                            <option value="lab" ${entity && entity.tipo === "lab" ? "selected" : ""}>Laboratório</option>
                            <option value="sala" ${entity && entity.tipo === "sala" ? "selected" : ""}>Sala de Aula</option>
                            <option value="auditorio" ${entity && entity.tipo === "auditorio" ? "selected" : ""}>Auditório</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="capacidade">Capacidade</label>
                        <input type="number" id="capacidade" name="capacidade" min="1" placeholder="Número de lugares"
                               value="${entity ? entity.capacidade : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="localizacao">Localização</label>
                        <input type="text" id="localizacao" name="localizacao" placeholder="Ex: Bloco B, 1º andar"
                               value="${entity ? entity.localizacao : ""}" required>
                    </div>
                `;
                break;
                
            case "disciplinas":
                formHTML = `
                    <div class="form-group">
                        <label for="nome">Nome da disciplina</label>
                        <input type="text" id="nome" name="nome" placeholder="Nome da disciplina"
                               value="${entity ? entity.nome : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="curso">Curso</label>
                        <select id="curso" name="curso" required>
                            <option value="">Selecione o curso</option>
                            <option value="DSM" ${entity && entity.curso === "DSM" ? "selected" : ""}>Desenvolvimento de Software Multiplataforma</option>
                            <option value="GEO" ${entity && entity.curso === "GEO" ? "selected" : ""}>Geoprocessamento</option>
                            <option value="MAR" ${entity && entity.curso === "MAR" ? "selected" : ""}>Meio Ambiente e Recursos Hídricos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="semestre">Semestre</label>
                        <select id="semestre" name="semestre" required>
                            <option value="">Selecione o semestre</option>
                            <option value="1" ${entity && entity.semestre === 1 ? "selected" : ""}>1º Semestre</option>
                            <option value="2" ${entity && entity.semestre === 2 ? "selected" : ""}>2º Semestre</option>
                            <option value="3" ${entity && entity.semestre === 3 ? "selected" : ""}>3º Semestre</option>
                            <option value="4" ${entity && entity.semestre === 4 ? "selected" : ""}>4º Semestre</option>
                            <option value="5" ${entity && entity.semestre === 5 ? "selected" : ""}>5º Semestre</option>
                            <option value="6" ${entity && entity.semestre === 6 ? "selected" : ""}>6º Semestre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="aulas">Aulas por semana</label>
                        <input type="number" id="aulas" name="aulas" min="1" max="20" placeholder="Ex: 4"
                               value="${entity ? entity.aulas : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="cor">Cor de identificação</label>
                        <input type="color" id="cor" name="cor" value="${entity ? entity.cor : "#E30613"}">
                    </div>
                `;
                break;
                
            case "cursos":
                formHTML = `
                    <div class="form-group">
                        <label for="nome">Nome do curso</label>
                        <input type="text" id="nome" name="nome" placeholder="Nome completo do curso"
                               value="${entity ? entity.nome : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="sigla">Sigla</label>
                        <input type="text" id="sigla" name="sigla" placeholder="Ex: DSM"
                               value="${entity ? entity.sigla : ""}" required>
                    </div>
                    <div class="form-group">
                        <label for="semestres">Duração (semestres)</label>
                        <input type="number" id="semestres" name="semestres" min="1" max="12" 
                               value="${entity ? entity.semestres : "6"}" required>
                    </div>
                    <div class="form-group">
                        <label for="coordenador">Coordenador</label>
                        <input type="text" id="coordenador" name="coordenador" placeholder="Nome do coordenador"
                               value="${entity ? entity.coordenador : ""}" required>
                    </div>
                `;
                break;
        }
        
        DOM.formContainer.innerHTML = formHTML;
    }
    
    // Inicializar a busca
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            const cards = DOM.entityList.querySelectorAll(".entity-card");
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
    
    // Inicializar as funções
    function init() {
        initSidebarState();
        updateDashboardStats();
        updateRecentActivities();
        
        if (document.getElementById('recent-access')) {
            renderRecentAccess();
        }
    }

    // Iniciar a aplicação
    init();

    // Função para atualizar as estatísticas do dashboard
    function updateDashboardStats() {
        // Atualizar estatísticas com dados reais
        const stats = {
            docentes: mockData.docentes.length,
            salas: mockData.salas.length,
            disciplinas: mockData.disciplinas.length,
            cursos: mockData.cursos.length
        };

        // Atualizar os números nas cards de estatísticas
        document.querySelectorAll('.stat-number').forEach(stat => {
            const type = stat.closest('.stat-card').querySelector('h3').textContent.toLowerCase();
            if (stats[type]) {
                stat.textContent = stats[type];
            }
        });
    }

    // Função para atualizar as atividades recentes
    function updateRecentActivities() {
        const activities = [
            {
                icon: 'user-plus',
                text: 'Novo docente cadastrado',
                time: 'Há 2 horas'
            },
            {
                icon: 'calendar-plus',
                text: 'Novo semestre iniciado',
                time: 'Há 1 dia'
            },
            {
                icon: 'map-marked-alt',
                text: 'Mapa atualizado',
                time: 'Há 3 dias'
            }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-${activity.icon}"></i>
                    </div>
                    <div class="activity-info">
                        <p>${activity.text}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Função para gerenciar acessos recentes
    function updateRecentAccess(entityName) {
        // Obter acessos recentes do localStorage ou inicializar array vazio
        let recentAccess = JSON.parse(localStorage.getItem('recentAccess')) || [];
        
        // Remover a entidade se já existir (para evitar duplicatas)
        recentAccess = recentAccess.filter(item => item.name !== entityName);
        
        // Adicionar a nova entidade no início do array
        recentAccess.unshift({
            name: entityName,
            timestamp: new Date().getTime()
        });
        
        // Manter apenas os 3 acessos mais recentes
        recentAccess = recentAccess.slice(0, 3);
        
        // Salvar no localStorage
        localStorage.setItem('recentAccess', JSON.stringify(recentAccess));
        
        // Atualizar a interface
        renderRecentAccess();
    }

    // Função para renderizar os acessos recentes
    function renderRecentAccess() {
        const recentAccessContainer = document.getElementById('recent-access');
        if (!recentAccessContainer) return;
        
        const recentAccess = JSON.parse(localStorage.getItem('recentAccess')) || [];
        
        // Limpar o container
        recentAccessContainer.innerHTML = '';
        
        // Mapear ícones para cada tipo de entidade
        const entityIcons = {
            docentes: 'chalkboard-teacher',
            semestres: 'calendar-alt',
            salas: 'door-open',
            disciplinas: 'book',
            cursos: 'graduation-cap',
            mapas: 'map-marked-alt'
        };
        
        // Criar cards para cada acesso recente
        recentAccess.forEach(item => {
            const card = document.createElement('div');
            card.className = 'admin-button';
            card.dataset.entity = item.name;
            
            const icon = entityIcons[item.name] || 'circle';
            
            card.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
            `;
            
            // Adicionar evento de clique
            card.addEventListener('click', function() {
                const entityName = this.getAttribute('data-entity');
                showEntityList(entityName);
                if (DOM.breadcrumb) {
                    DOM.breadcrumb.textContent = entityName.charAt(0).toUpperCase() + entityName.slice(1);
                }
            });
            
            recentAccessContainer.appendChild(card);
        });
    }

    // Função para lidar com importação de CSV
    function handleImportCSV() {
        // Criar input de arquivo invisível
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.style.display = 'none';
        
        // Adicionar ao DOM
        document.body.appendChild(fileInput);
        
        // Trigger click no input
        fileInput.click();
        
        // Lidar com a seleção do arquivo
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const csvData = e.target.result;
                        processCSV(csvData);
                    } catch (error) {
                        console.error('Erro ao processar arquivo CSV');
                    }
                };
                reader.readAsText(file);
            }
            
            // Limpar input
            document.body.removeChild(fileInput);
        });
    }

    // Função para processar o CSV
    function processCSV(csvData) {
        try {
            // Dividir linhas
            const lines = csvData.split('\n');
            if (lines.length < 2) throw new Error('CSV inválido');
            
            // Obter cabeçalhos
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Processar dados
            const docentes = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(v => v.trim());
                const docente = {};
                
                headers.forEach((header, index) => {
                    if (header === 'disciplinas') {
                        docente[header] = values[index].split(';').map(d => d.trim());
                    } else {
                        docente[header] = values[index];
                    }
                });
                
                docentes.push(docente);
            }
            
            // Adicionar docentes ao mockData
            docentes.forEach(docente => {
                const newId = Math.max(...mockData.docentes.map(d => d.id)) + 1;
                mockData.docentes.push({
                    id: newId,
                    ...docente
                });
            });
            
            // Atualizar a lista
            showEntityList('docentes');
            console.warn('Docentes importados com sucesso');
            
        } catch (error) {
            console.error('Erro ao processar arquivo CSV');
        }
    }
});