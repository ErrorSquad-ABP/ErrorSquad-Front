// Função para exportar para PDF
function exportarParaPDF() {
    const element = document.getElementById('map-content');
    const opt = {
        margin: 1,
        filename: 'mapa-interativo.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
}

// Função para exportar para CSV
function exportarParaCSV() {
    // Obter todos os elementos de sala
    const salas = document.querySelectorAll('.sala');
    let csvContent = "Sala,Nome,Curso,Professor,Disciplina,Horario\n";

    salas.forEach(sala => {
        const numero = sala.querySelector('.numero-sala')?.textContent || '';
        const nome = sala.querySelector('.nome-sala')?.textContent || '';
        const curso = sala.querySelector('.curso-sala')?.textContent || '';
        const professor = sala.querySelector('.professor-sala')?.textContent || '';
        const disciplina = sala.querySelector('.disciplina-sala')?.textContent || '';
        const horario = sala.querySelector('.horario-sala')?.textContent || '';

        // Escapar vírgulas e aspas no conteúdo
        const escapeCSV = (str) => {
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        csvContent += `${escapeCSV(numero)},${escapeCSV(nome)},${escapeCSV(curso)},${escapeCSV(professor)},${escapeCSV(disciplina)},${escapeCSV(horario)}\n`;
    });

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'mapa-interativo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inicializar o dropdown
document.addEventListener('DOMContentLoaded', function() {
    const exportDropdown = document.getElementById('exportDropdown');
    const dropdownMenu = exportDropdown.nextElementSibling;

    // Toggle do dropdown
    exportDropdown.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownMenu.classList.toggle('show');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (!exportDropdown.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Eventos de exportação
    document.getElementById('exportar-pdf').addEventListener('click', function(e) {
        e.preventDefault();
        exportarParaPDF();
        dropdownMenu.classList.remove('show');
    });

    document.getElementById('exportar-csv').addEventListener('click', function(e) {
        e.preventDefault();
        exportarParaCSV();
        dropdownMenu.classList.remove('show');
    });
}); 