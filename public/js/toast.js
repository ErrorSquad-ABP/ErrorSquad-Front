// Sistema de Toast para mensagens de feedback
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Ícone SVG de acordo com o tipo
    const icon = type === 'success'
        ? '<svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#4CAF50"/><path d="M6 10.5l2.5 2.5L14 7.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#f44336"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

    const toast = document.createElement('div');
    toast.className = `toast${type === 'error' ? ' error' : ''}`;
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Fechar">&times;</button>
    `;

    // Fechar ao clicar no X
    toast.querySelector('.toast-close').onclick = () => {
        toast.remove();
    };

    toastContainer.appendChild(toast);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Sistema de Toast compartilhado
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        showToast(message, type); // Usa o novo padrão visual
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Cria uma instância global do Toast
const toast = new Toast();

export { toast, showToast };

// Deixa a função showToast disponível globalmente
window.showToast = showToast; 