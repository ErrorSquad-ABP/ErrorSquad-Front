// Sistema de Notificações Global
document.addEventListener("DOMContentLoaded", function() {
    // Elementos do DOM
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationList = document.querySelector('.notification-list');
    const notificationCount = document.querySelector('.notification-count');

    // Dados de exemplo para notificações (apenas não lidas)
    let notifications = [
        {
            id: 1,
            title: "Novo Curso Adicionado",
            message: "O curso de Desenvolvimento de Software Multiplataforma foi adicionado com sucesso.",
            time: "5 minutos atrás",
            type: "success"
        },
        {
            id: 2,
            title: "Atualização de Grade",
            message: "A grade horária do curso de Geoprocessamento foi atualizada.",
            time: "1 hora atrás",
            type: "info"
        },
        {
            id: 3,
            title: "Alerta de Sistema",
            message: "O sistema será atualizado hoje às 22:00.",
            time: "2 horas atrás",
            type: "warning"
        }
    ];

    // Função para renderizar as notificações
    function renderNotifications() {
        notificationList.innerHTML = '';
        
        // Atualizar contador
        notificationCount.textContent = notifications.length;
        notificationCount.style.display = notifications.length > 0 ? 'flex' : 'none';

        // Renderizar cada notificação
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.type}`;
            notificationItem.dataset.id = notification.id;

            notificationItem.innerHTML = `
                <div class="notification-content">
                    <div class="notification-header">
                        <h4>${notification.title}</h4>
                        <span class="notification-time">${notification.time}</span>
                    </div>
                    <p>${notification.message}</p>
                </div>
                <div class="notification-actions">
                    <button class="mark-read" title="Marcar como lida">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;

            notificationList.appendChild(notificationItem);
        });

        // Se não houver notificações, mostrar mensagem
        if (notifications.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'no-notifications';
            emptyMessage.textContent = 'Não há notificações';
            notificationList.appendChild(emptyMessage);
        }
    }

    // Função para marcar notificação como lida
    function markAsRead(id) {
        // Remove a notificação imediatamente
        notifications = notifications.filter(n => n.id !== id);
        
        // Fecha o dropdown se não houver mais notificações
        if (notifications.length === 0) {
            notificationDropdown.classList.remove('show');
        }
        
        renderNotifications();
    }

    // Função para adicionar nova notificação
    function addNotification(notification) {
        notification.id = Date.now();
        notification.time = "Agora mesmo";
        notifications.unshift(notification);
        renderNotifications();
    }

    // Event Listeners
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(e) {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Event delegation para ações nas notificações
        notificationList.addEventListener('click', function(e) {
            const markReadButton = e.target.closest('.mark-read');
            if (markReadButton) {
                e.preventDefault();
                e.stopPropagation();
                
                const notificationItem = e.target.closest('.notification-item');
                if (notificationItem) {
                    const id = parseInt(notificationItem.dataset.id);
                    markAsRead(id);
                }
            }
        });
    }

    // Exemplo de como adicionar uma nova notificação
    function addExampleNotification() {
        const types = ['success', 'info', 'warning'];
        const titles = [
            'Nova Atividade',
            'Atualização do Sistema',
            'Alerta Importante'
        ];
        const messages = [
            'Uma nova atividade foi adicionada ao curso.',
            'O sistema foi atualizado com novas funcionalidades.',
            'Atenção: Manutenção programada para hoje.'
        ];

        const randomIndex = Math.floor(Math.random() * types.length);
        addNotification({
            title: titles[randomIndex],
            message: messages[randomIndex],
            type: types[randomIndex]
        });
    }

    // Adicionar notificação de exemplo a cada 30 segundos
    setInterval(addExampleNotification, 30000);

    // Inicializar renderização
    renderNotifications();
}); 