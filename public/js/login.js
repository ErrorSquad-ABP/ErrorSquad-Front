import { login } from './fetchFunctions/fetchAuth.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Verificar se já está autenticado
    if (localStorage.getItem('token')) {
        window.location.href = '/home';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        // Limpar mensagens de erro anteriores
        clearError('email');
        clearError('senha');
        
        // Validar campos
        if (!validateForm(email, senha)) {
            return;
        }
        
        try {
            await login(email, senha);
            // Após login bem-sucedido
            window.location.href = '/home';
        } catch (error) {
            console.error('Erro no login:', error);
            if (error.message === 'Email ou senha inválidos') {
                showAlert('Email ou senha inválidos', 'error');
            } else {
                showAlert('Erro ao fazer login. Por favor, tente novamente.', 'error');
            }
        }
    });
});

function validateForm(email, senha) {
    let isValid = true;
    
    if (!email) {
        showError('email', 'Por favor, preencha o email');
        isValid = false;
    }
    
    if (!senha) {
        showError('senha', 'Por favor, preencha a senha');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    
    element.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    
    element.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

function showAlert(message, type = 'error') {
    const alert = document.getElementById('custom-alert');
    const alertMessage = alert.querySelector('.alert-message');
    const alertIcon = alert.querySelector('.alert-icon i');
    
    // Configurar o alerta
    alert.className = `custom-alert ${type}`;
    alertMessage.textContent = message;
    
    // Configurar o ícone
    if (type === 'error') {
        alertIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'success') {
        alertIcon.className = 'fas fa-check-circle';
    }
    
    // Mostrar o alerta
    alert.style.display = 'flex';
    
    // Configurar o botão de fechar
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.onclick = () => {
        alert.classList.add('hide');
        setTimeout(() => {
            alert.style.display = 'none';
            alert.classList.remove('hide');
        }, 300);
    };
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
        if (alert.style.display === 'flex') {
            alert.classList.add('hide');
            setTimeout(() => {
                alert.style.display = 'none';
                alert.classList.remove('hide');
            }, 300);
        }
    }, 5000);
} 