// Exporta o PDF do andar atual em PAISAGEM, com cores fiéis
function setupPdfExport() {
    const btn = document.getElementById('exportar-pdf');
    if (!btn) return;
  
    btn.addEventListener('click', async () => {
        const elemento = document.getElementById('map-content');
        if (!elemento) return alert('Mapa não encontrado!');
    
        // 1) Foto em canvas
        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        const imgData = canvas.toDataURL('image/png');
    
        // 2) PDF em landscape
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    
        // 3) Margens e área útil
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;  // mm
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
    
        // 4) Escala proporcional
        const scaleW = maxW  / canvas.width;
        const scaleH = maxH  / canvas.height;
        const scale  = Math.min(scaleW, scaleH);
        const imgW   = canvas.width  * scale;
        const imgH   = canvas.height * scale;
    
        // 5) Centraliza
        const x = (pageW - imgW) / 2;
        const y = (pageH - imgH) / 2;
    
        // 6) Insere sem esticar
        pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);
    
        // 7) Baixa
        pdf.save(`mapa-andar-${currentFloor}.pdf`);
    });
}