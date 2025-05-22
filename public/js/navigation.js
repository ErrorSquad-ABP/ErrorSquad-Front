document.addEventListener('DOMContentLoaded', function() {
    // Função para normalizar o caminho da página
    function normalizePath(path) {
        // Considera todas as variações possíveis para a home
        if (
            path === '/' ||
            path === '/home' ||
            path === '/home.html' ||
            path.endsWith('/adm/home.html') ||
            path.endsWith('/adm/home') ||
            path.endsWith('/public/adm/home') ||
            path.endsWith('/public/adm/home.html')
        ) {
            return '/home';
        }
        // Remove .html do final, se existir
        return path.replace('.html', '');
    }

    // Função para atualizar a seleção da sidebar
    function updateSidebarSelection() {
        // Remove a classe active de todos os links
        document.querySelectorAll('.sidebar-item a').forEach(link => {
            link.classList.remove('active');
        });

        // Encontra o link correspondente ao caminho atual
        const currentPath = normalizePath(window.location.pathname);
        const currentLink = document.querySelector(`.sidebar-item a[data-page="${currentPath}"]`);
        
        // Se encontrou o link, adiciona a classe active
        if (currentLink) {
            currentLink.classList.add('active');
        } else if (currentPath === '/admin') {
            // Caso especial para a página de admin
            document.getElementById('adm-link').classList.add('active');
        } else {
            // Se não encontrou nenhum link correspondente, seleciona a home
            document.querySelector('.sidebar-item a[data-page="/home"]').classList.add('active');
        }
    }

    // Atualiza a seleção inicial
    updateSidebarSelection();

    // Adiciona event listeners para os links da sidebar
    document.querySelectorAll('.sidebar-item a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            window.location.href = page;
        });
    });

    // Event listener para o link de admin
    document.getElementById('adm-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/admin';
    });

    // Event listener para o botão de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Aqui você pode adicionar a lógica de logout
        window.location.href = '/login';
    });
}); 