// Função para abrir o modal
function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Função para fechar o modal
function closeModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Fechar modal quando clicar fora dele
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// Fechar modal quando pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.classList.remove('active'));
    }
}); 