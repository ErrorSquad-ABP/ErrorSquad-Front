class SwapProtectionManager {
    constructor() {
        this.swapInProgress = false;
        this.lockedCells = new Set();
        this.currentSwapCells = new Set();
        this.lockTimeoutId = null;
        this.initialized = false;
    }

    // Inicializar CSS apenas uma vez
    init() {
        if (this.initialized) return;
        
        this.addProtectionCSS();
        this.initialized = true;
        console.log('🛡️ SwapProtection inicializado');
    }

    getCellId(cell) {
        const dia = cell.getAttribute('data-dia');
        const horario = cell.getAttribute('data-horario');
        const periodo = cell.getAttribute('data-id-periodo') || 'empty';
        return `${dia}-${horario}-${periodo}`;
    }

    isCellLocked(cell) {
        const cellId = this.getCellId(cell);
        return this.lockedCells.has(cellId) || this.currentSwapCells.has(cellId);
    }

    isSwapInProgress() {
        return this.swapInProgress;
    }

    startSwap(cell1, cell2) {
        if (this.swapInProgress) {
            console.warn('🔒 Swap já em progresso');
            return false;
        }

        const cell1Id = this.getCellId(cell1);
        const cell2Id = this.getCellId(cell2);

        if (this.lockedCells.has(cell1Id) || this.lockedCells.has(cell2Id)) {
            console.warn('🔒 Células bloqueadas para swap');
            return false;
        }

        // Iniciar proteção
        this.swapInProgress = true;
        this.currentSwapCells.add(cell1Id);
        this.currentSwapCells.add(cell2Id);

        // Bloquear todas as outras células
        this.lockAllOtherCells([cell1, cell2]);
        this.applySwapStyles(cell1, cell2);

        console.log(`🔄 Swap iniciado: ${cell1Id} ↔ ${cell2Id}`);
        return true;
    }

    finishSwap(success = true) {
        if (!this.swapInProgress) return;

        if (this.lockTimeoutId) {
            clearTimeout(this.lockTimeoutId);
            this.lockTimeoutId = null;
        }

        // Resetar estado
        this.swapInProgress = false;
        this.currentSwapCells.clear();
        this.lockedCells.clear();

        // Remover estilos e reativar células
        this.removeAllLockStyles();
        this.enableAllCellInteractions();

        console.log(`✅ Swap ${success ? 'concluído' : 'cancelado'}`);
    }

    lockAllOtherCells(exemptCells) {
        const allCells = document.querySelectorAll('.grade-table td[data-dia][data-horario]');
        
        allCells.forEach(cell => {
            if (!exemptCells.includes(cell)) {
                const cellId = this.getCellId(cell);
                this.lockedCells.add(cellId);
                
                // Aplicar bloqueio visual
                cell.classList.add('cell-locked-swap');
                cell.style.pointerEvents = 'none';
                cell.draggable = false;
            }
        });
    }

    applySwapStyles(cell1, cell2) {
        [cell1, cell2].forEach(cell => {
            cell.classList.add('swap-in-progress');
            cell.style.border = '3px solid #FF9800';
            cell.style.animation = 'swapPulse 1.5s infinite';
            cell.style.zIndex = '1000';
        });
    }

    removeAllLockStyles() {
        const allCells = document.querySelectorAll('.grade-table td');
        allCells.forEach(cell => {
            cell.classList.remove('swap-in-progress', 'cell-locked-swap');
            cell.style.border = '';
            cell.style.animation = '';
            cell.style.pointerEvents = '';
            cell.style.zIndex = '';
        });
    }

    enableAllCellInteractions() {
        const allCells = document.querySelectorAll('.grade-table td[data-dia][data-horario]');
        allCells.forEach(cell => {
            cell.style.pointerEvents = '';
            cell.draggable = true;
        });
    }

    setSwapTimeout(timeoutMs = 12000) {
        this.lockTimeoutId = setTimeout(() => {
            console.warn('⚠️ Timeout de swap - forçando desbloqueio');
            this.finishSwap(false);
        }, timeoutMs);
    }

    addProtectionCSS() {
        // Evitar duplicação de CSS
        if (document.getElementById('swap-protection-css')) return;

        const swapCSS = document.createElement('style');
        swapCSS.id = 'swap-protection-css';
        swapCSS.textContent = `
            @keyframes swapPulse {
                0% { 
                    border-color: #FF9800; 
                    transform: scale(1); 
                    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
                }
                50% { 
                    border-color: #FFC107; 
                    transform: scale(1.02); 
                    box-shadow: 0 0 0 8px rgba(255, 152, 0, 0.1);
                }
                100% { 
                    border-color: #FF9800; 
                    transform: scale(1); 
                    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
                }
            }
            
            .swap-in-progress {
                z-index: 1000 !important;
                position: relative;
                opacity: 0.9 !important;
                border-radius: 8px !important;
            }
            
            .cell-locked-swap {
                opacity: 0.25 !important;
                filter: grayscale(80%) blur(1px);
                cursor: not-allowed !important;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .cell-locked-swap::before {
                content: '🔒';
                position: absolute;
                top: 4px;
                right: 4px;
                font-size: 14px;
                z-index: 100;
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .cell-locked-swap .aula-item {
                pointer-events: none;
                user-select: none;
            }
        `;
        document.head.appendChild(swapCSS);
    }

    // Métodos utilitários para integração
    createProtectedDragStart(originalCallback, showErrorToast) {
        return (e) => {
            const cell = e.currentTarget;

            // Verificações de proteção
            if (this.isSwapInProgress()) {
                e.preventDefault();
                showErrorToast('⚠️ Sistema bloqueado durante troca. Aguarde...');
                return;
            }

            if (this.isCellLocked(cell)) {
                e.preventDefault();
                showErrorToast('⚠️ Esta célula está temporariamente bloqueada.');
                return;
            }

            // Executar callback original se passou nas verificações
            if (originalCallback) {
                originalCallback(e);
            }
        };
    }

    createProtectedDrop(originalCallback, showErrorToast) {
        return async (e) => {
            const origem = window.draggedCell;
            const destino = e.currentTarget;

            // Verificações de proteção
            if (this.isSwapInProgress()) {
                e.preventDefault();
                showErrorToast('⚠️ Operação de troca em andamento. Aguarde...');
                return;
            }

            if (this.isCellLocked(origem) || this.isCellLocked(destino)) {
                e.preventDefault();
                showErrorToast('⚠️ Uma das células está bloqueada para troca.');
                return;
            }

            // Executar callback original se passou nas verificações
            if (originalCallback) {
                return await originalCallback(e);
            }
        };
    }
}

// Exportar instância única (Singleton)
const swapProtection = new SwapProtectionManager();

export default swapProtection;