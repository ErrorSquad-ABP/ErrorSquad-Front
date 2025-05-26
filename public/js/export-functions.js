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

// Inicializar o botão de exportação
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('exportar-pdf').addEventListener('click', function(e) {
        e.preventDefault();
        exportarParaPDF();
    });
}); 