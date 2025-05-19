// Inicializar IRONGATE
if (typeof IRONGATE === 'function') {
    IRONGATE();
}

// Script específico para o Painel Administrativo
document.addEventListener("DOMContentLoaded", function() {
    // Elementos
    const adminCards = document.querySelectorAll('.admin-card');
    const actionButtons = document.querySelectorAll('.admin-actions button');
    const userProfile = document.getElementById('userProfile');
    
    // Criar overlay para fechar o dropdown
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    // Criar container para toasts se não existir
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Função para mostrar toast
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        
        toastContainer.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Função para toggle do dropdown do perfil
    function toggleProfileDropdown() {
        const isActive = userProfile.classList.contains('active');
        
        if (isActive) {
            userProfile.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            userProfile.classList.add('active');
            overlay.classList.add('active');
        }
    }
    
    // Event Listener para o perfil do usuário
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileDropdown();
    });
    
    // Event Listener para fechar o dropdown ao clicar fora
    overlay.addEventListener('click', () => {
        userProfile.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Event Listener para os itens do dropdown
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.target.textContent.trim();
            
            switch(action) {
                case 'Gerenciar Perfil':
                    showToast('Abrindo gerenciamento de perfil...', 'info');
                    break;
                case 'Alterar Senha':
                    showToast('Abrindo alteração de senha...', 'info');
                    break;
                case 'Permissões':
                    showToast('Abrindo gerenciamento de permissões...', 'info');
                    break;
                case 'Histórico de Atividades':
                    showToast('Carregando histórico de atividades...', 'info');
                    break;
                case 'Sair':
                    showToast('Saindo do sistema...', 'info');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                    break;
            }
            
            toggleProfileDropdown();
        });
    });
    
    // Função para gerenciar usuários
    function gerenciarUsuarios(acao) {
        switch(acao) {
            case 'novo':
                showToast('Abrindo formulário de novo usuário...', 'info');
                // Aqui você implementaria a lógica para abrir o formulário
                break;
            case 'listar':
                showToast('Carregando lista de usuários...', 'info');
                // Aqui você implementaria a lógica para listar usuários
                break;
        }
    }
    
    // Função para gerenciar permissões
    function gerenciarPermissoes(acao) {
        switch(acao) {
            case 'nova':
                showToast('Abrindo formulário de nova permissão...', 'info');
                // Aqui você implementaria a lógica para abrir o formulário
                break;
            case 'listar':
                showToast('Carregando lista de permissões...', 'info');
                // Aqui você implementaria a lógica para listar permissões
                break;
        }
    }
    
    // Função para gerenciar logs
    function gerenciarLogs(acao) {
        switch(acao) {
            case 'exportar':
                showToast('Iniciando exportação de logs...', 'info');
                // Aqui você implementaria a lógica para exportar logs
                break;
            case 'filtrar':
                showToast('Abrindo filtros de logs...', 'info');
                // Aqui você implementaria a lógica para filtrar logs
                break;
        }
    }
    
    // Função para gerenciar backups
    function gerenciarBackups(acao) {
        switch(acao) {
            case 'novo':
                showToast('Iniciando novo backup...', 'info');
                // Aqui você implementaria a lógica para criar backup
                break;
            case 'historico':
                showToast('Carregando histórico de backups...', 'info');
                // Aqui você implementaria a lógica para mostrar histórico
                break;
        }
    }
    
    // Event Listeners para botões de ação
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.admin-card');
            const acao = button.textContent.trim().toLowerCase();
            
            // Identificar qual card foi clicado
            if (card.querySelector('h3').textContent.includes('Usuários')) {
                gerenciarUsuarios(acao);
            } else if (card.querySelector('h3').textContent.includes('Permissões')) {
                gerenciarPermissoes(acao);
            } else if (card.querySelector('h3').textContent.includes('Logs')) {
                gerenciarLogs(acao);
            } else if (card.querySelector('h3').textContent.includes('Backup')) {
                gerenciarBackups(acao);
            }
        });
    });
    
    // Verificar permissões de administrador
    function verificarPermissoesAdmin() {
        // Aqui você implementaria a lógica para verificar se o usuário tem permissão de admin
        const isAdmin = true; // Simulado para demonstração
        
        if (!isAdmin) {
            // Redirecionar para página inicial se não for admin
            window.location.href = '/home';
        }
    }
    
    // Inicializar a página
    verificarPermissoesAdmin();
}); 