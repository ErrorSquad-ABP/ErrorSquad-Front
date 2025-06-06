export class CSSLoader {
    constructor() {
        this.loadedFiles = new Set();
    }

    async loadGradeCSS() {
        const cssPaths = [
            '/public/css/grade-horarios.css',
            './css/grade-horarios.css',
            '../css/grade-horarios.css'
        ];

        // Tentar cada caminho até um funcionar
        for (const path of cssPaths) {
            try {
                await this.loadCSS(path);
                console.log(`✅ CSS carregado: ${path}`);
                return true;
            } catch (error) {
                console.warn(`❌ Falhou: ${path}`);
            }
        }

        console.error('🚨 Todos os caminhos CSS falharam');
        return false;
    }

    loadCSS(href, timeout = 8000) {
        return new Promise((resolve, reject) => {
            // Evitar duplicação
            if (this.loadedFiles.has(href)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = href;

            // Timeout de segurança
            const timer = setTimeout(() => {
                link.remove();
                reject(new Error(`Timeout: ${href}`));
            }, timeout);

            link.onload = () => {
                clearTimeout(timer);
                this.loadedFiles.add(href);
                resolve();
            };

            link.onerror = () => {
                clearTimeout(timer);
                link.remove();
                reject(new Error(`Erro: ${href}`));
            };

            document.head.appendChild(link);
        });
    }
} 