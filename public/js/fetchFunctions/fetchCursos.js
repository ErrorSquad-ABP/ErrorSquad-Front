import { getToken, getUserData } from './fetchAuth.js';

const API_URL = 'https://errorsquad-server.onrender.com';

function getAdminId() {
    return getUserData().id;
}

export async function getCursos() {
  try {
    const response = await fetch(`${API_URL}/admin/${getAdminId()}/cursos`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getToken()}`
          },
      });

      let result = await response.json();
      let data = result.data;

      if (result === 'Token inválido.'){
          return null; // Retorna os dados processados
       }
       else{
          return data
       }
  } catch (error) {
      console.error('Erro:', error);
      return null; // Retorna null em caso de erro
  }
}

export async function createCurso(nome, sigla, coordenador, inicio, fim) {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/cursos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                nome: nome,
                coordenador: coordenador,
                sigla: sigla,
                inicio: inicio,
                fim: fim
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar curso');
        }

        return { ok: true, data };
    } catch (error) {
        return { ok: false, error: error.message };
    }
}

export async function updateCurso(nome, sigla, coordenador, inicio, fim) {
    try {
      const response = await fetch(`${API_URL}/admin/${getAdminId()}/cursos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: {
                nome: nome,
                coordenador: coordenador,
                sigla: sigla,
                inicio: inicio,
                fim: fim
            }
        });
  
        let result = await response.json();
        let data = result.data;
  
        if (result === 'Token inválido.'){
            return null; // Retorna os dados processados
         }
         else{
            return data
         }
    } catch (error) {
        console.error('Erro:', error);
        return null; // Retorna null em caso de erro
    }
}

export async function deleteCurso(id) {
    try {
        const response = await fetch(`${API_URL}/admin/${getAdminId()}/cursos`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ id })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
} 
