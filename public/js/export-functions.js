// Exportação do mapa interativo
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

// Exportação da grade de horários

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.querySelector('button[data-export="pdf"]');
    if (!exportBtn) return;
  
    exportBtn.addEventListener('click', async () => {
      // 1) Captura os <select> de curso, nível e turno
      const selects = document.querySelectorAll('.grade-actions select.btn-secondary');
      if (selects.length < 3) {
        return alert('Filtros não encontrados!');
      }
      const curso = selects[0].value.trim();   // ex: "DSM"
      const nivel = selects[1].value.trim();   // ex: "1"
      const turno = selects[2].value.trim();   // ex: "noite"
  
      // 2) Normaliza para nome de arquivo
      const safe = str => str.replace(/\s+/g, '_');
      const filename = `grade_${safe(curso)}_${safe(nivel)}_${safe(turno)}.pdf`;
  
      // 3) URL relativa na pasta public/assets
      const url = `/pdfs/${filename}`;
  
      // 4) HEAD para checar existência
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          return alert(
            `PDF não encontrado para estes filtros:\n` +
            `Curso: ${curso}\nNível: ${nivel}\nTurno: ${turno}`
          );
        }
      } catch (err) {
        console.error('Erro ao verificar PDF:', err);
        return alert('Erro de conexão ao buscar o PDF.');
      }
  
      // 5) Dispara o download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
