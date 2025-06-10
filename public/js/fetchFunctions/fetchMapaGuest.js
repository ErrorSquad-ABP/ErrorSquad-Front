const API_URL = 'https://gerenciamento-pedagogico-server.koyeb.app';

export async function getSalasInfo() {
    try {

        console.log('Buscando dados da grade...');
        const response = await fetch(`${API_URL}/guest/periodos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("A resposta não é um JSON válido!");
        }

        const result = await response.json();
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0].periodos || 'Períodos não encontrados';
        } else {
            console.error('Erro: Dados não encontrados na resposta');
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar dados do mapa:', error);
        throw error;
    }
}