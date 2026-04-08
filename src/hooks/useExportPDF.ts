// src/hooks/useExportPDF.ts
// Orchestrates html2canvas and jsPDF to export the portfolio canvas as a PDF.
import { useState, useCallback } from 'react';

export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = useCallback(async (fileName: string = 'Resume') => {
    const node = document.getElementById('resume-a4-node');
    if (!node) {
      console.error('PDF export target #resume-a4-node not found');
      return;
    }

    setIsExporting(true);

    try {
      // Load heavy PDF dependencies on demand to keep initial bundles smaller.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportPDF, isExporting };
};
