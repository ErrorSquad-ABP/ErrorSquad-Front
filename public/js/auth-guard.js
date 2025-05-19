// IRONGATE Protocol - Sistema de Segurança Avançado
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('[IRONGATE] Erro ao decodificar token:', error);
        return null;
    }
}

function IRONGATE() {
    console.warn('[IRONGATE] Iniciando protocolo de segurança...');
    
    // Verificar token no localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('[IRONGATE] Token não encontrado. Redirecionando para login...');
        window.location.href = '/login';
        return;
    }

    try {
        // Decodificar e validar token
        const decodedToken = parseJwt(token);
        if (!decodedToken) {
            throw new Error('Token inválido');
        }

        // Verificar expiração
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
            console.error('[IRONGATE] Token expirado');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        // Verificar ID do usuário
        if (!decodedToken.id) {
            console.error('[IRONGATE] ID do usuário não encontrado no token');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        // Armazenar ID do usuário
        localStorage.setItem('userId', decodedToken.id);
        console.warn('[IRONGATE] Protocolo de segurança concluído com sucesso');
        
        // Iniciar monitoramento de atividade
        monitorarAtividade();
        
    } catch (error) {
        console.error('[IRONGATE] Erro na validação:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}

// Monitoramento de atividade
function monitorarAtividade() {
    let ultimaAtividade = Date.now();
    const tempoLimite = 30 * 60 * 1000; // 30 minutos

    // Monitorar eventos do usuário
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventos.forEach(evento => {
        document.addEventListener(evento, () => {
            ultimaAtividade = Date.now();
        });
    });

    // Verificar inatividade
    setInterval(() => {
        if (Date.now() - ultimaAtividade > tempoLimite) {
            console.warn('[IRONGATE] Inatividade detectada. Encerrando sessão...');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }, 60000); // Verificar a cada minuto
}

// Iniciar IRONGATE quando a página carregar
document.addEventListener('DOMContentLoaded', IRONGATE);

// Tornar IRONGATE disponível globalmente
window.IRONGATE = IRONGATE; 