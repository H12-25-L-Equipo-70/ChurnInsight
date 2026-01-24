import { Injectable } from '@angular/core';
import { 
  PredictionResponse, 
  QuarterlyMetrics, 
  StaticProfile 
} from '../models/churn.interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * ExportService
 * Servicio para exportar y formatear datos de predicciones
 * Soporta: CSV, JSON, PDF (future)
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  /**
   * Exporta los datos de predicción a CSV
   * Maneja valores nulos y formatea seguramente
   */
  exportToCSV(
    profile: Partial<StaticProfile>,
    metrics: QuarterlyMetrics,
    result: PredictionResponse,
    filename: string = 'churn_prediction.csv'
  ): void {
    const timestamp = new Date().toISOString();
    
    const safeFormat = (value: any, fallback = 'N/A'): string => {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'number') return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
      return String(value);
    };
    
    const csvContent = `
ChurnInsight - Reporte de Predicción
Generado: ${timestamp}

PERFIL DE EMPRESA
CUIT,${profile?.CUIT || 'N/A'}
Nombre,${profile?.Nombre_Empresa || 'N/A'}
Sector,${profile?.Sector || 'N/A'}
Provincia,${profile?.Provincia || 'N/A'}

DATOS FINANCIEROS (ARS)
Ingresos,"${safeFormat(metrics?.financials?.Ingresos)}"
Gastos,"${safeFormat(metrics?.financials?.Gastos)}"
Margen,"${safeFormat(metrics?.financials?.Margen)}"
Deuda,"${safeFormat(metrics?.financials?.Deuda)}"
Activos,"${safeFormat(metrics?.financials?.Activos)}"

COMPORTAMIENTO DE CRÉDITO
Préstamos Solicitados,${metrics?.credit_behavior?.Prestamos_Solicitados || 0}
Préstamos Aprobados,${metrics?.credit_behavior?.Prestamos_Aprobados || 0}
Préstamos Vigentes,${metrics?.credit_behavior?.Prestamos_Vigentes || 0}
Monto Solicitado,"${safeFormat(metrics?.credit_behavior?.Monto_Solicitado)}"
Monto Aprobado,"${safeFormat(metrics?.credit_behavior?.Monto_Aprobado)}"

ENGAGEMENT EN PLATAFORMA
Días Activos,${metrics?.app_engagement?.Trimestre_Dias_Actividad || 0}
Días Inactivos,${metrics?.app_engagement?.Trimestre_Dias_Inactividad || 0}
Promedio de Logins/Día,${metrics?.app_engagement?.Promedio_Login_Dia || 0}
Total de Logins,${metrics?.app_engagement?.Total_Login_Dia || 0}

SERVICIOS UTILIZADOS
Transferencias,${metrics?.services_flags?.Transferencias ? 'Sí' : 'No'}
Pagos,${metrics?.services_flags?.Pagos ? 'Sí' : 'No'}
Créditos,${metrics?.services_flags?.Creditos ? 'Sí' : 'No'}
Inversiones,${metrics?.services_flags?.Inversiones ? 'Sí' : 'No'}
Total Servicios,${metrics?.services_flags?.Servicios_Utilizados || 0}/4

RESULTADO DE PREDICCIÓN
Nivel de Riesgo,${(result?.prevision || 'N/A').toUpperCase()}
Probabilidad de Churn,${((result?.probabilidad || 0) * 100).toFixed(2)}%
Confianza del Modelo,${((result?.confidence || 0) * 100).toFixed(0)}%

RECOMENDACIONES
${(result?.recomendaciones || []).map((rec, idx) => `${idx + 1}. ${rec}`).join('\n') || 'Continuar monitoreo regular'}

`;

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta los datos a JSON
   */
  exportToJSON(
    profile: Partial<StaticProfile>,
    metrics: QuarterlyMetrics,
    result: PredictionResponse,
    filename: string = 'churn_prediction.json'
  ): void {
    const payload = {
      timestamp: new Date().toISOString(),
      company: profile,
      metrics,
      prediction: result
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    this.downloadFile(
      jsonContent, 
      filename, 
      'application/json;charset=utf-8;'
    );
  }

  /**
   * Copia datos al portapapeles (útil para compartir)
   * Maneja valores nulos de manera segura
   */
  async copyToClipboard(
    profile: Partial<StaticProfile>,
    result: PredictionResponse
  ): Promise<boolean> {
    const text = `
ChurnInsight - Resultado de Predicción
Empresa: ${profile?.Nombre_Empresa || 'N/A'}
CUIT: ${profile?.CUIT || 'N/A'}

Nivel de Riesgo: ${(result?.prevision || 'N/A').toUpperCase()}
Probabilidad de Churn: ${((result?.probabilidad || 0) * 100).toFixed(1)}%
Confianza: ${((result?.confidence || 0) * 100).toFixed(0)}%

Recomendaciones:
${(result?.recomendaciones || []).map((rec) => `• ${rec}`).join('\n') || 'Sin recomendaciones adicionales'}
`;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      return false;
    }
  }

  /**
   * Genera un resumen de texto para presentaciones
   */
  generateSummary(
    profile: Partial<StaticProfile>,
    result: PredictionResponse
  ): string {
    const prevision = result.prevision || 'desconocido';
    const riskLevel = prevision.charAt(0).toUpperCase() + 
                      prevision.slice(1);
    const probability = ((result.probabilidad || 0) * 100).toFixed(1);

    return `
La empresa ${profile.Nombre_Empresa} (CUIT: ${profile.CUIT}) 
presenta un RIESGO ${riskLevel} de abandono con una probabilidad 
estimada del ${probability}%.

${result.recomendaciones && result.recomendaciones.length > 0
  ? `Acciones recomendadas:\n${result.recomendaciones.map((r) => `- ${r}`).join('\n')}`
  : 'Se recomienda continuar con el monitoreo regular de métricas.'
}
`;
  }

  /**
   * Descarga un archivo
   */
  private downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta a PDF con formato profesional y hermoso
   * Incluye estadísticas visuales y gráficos de riesgo
   */
  async exportToPDF(
    profile: Partial<StaticProfile>,
    metrics: QuarterlyMetrics,
    result: PredictionResponse,
    charts: { name: string, image: string }[] = [],
    filename: string = 'churn_prediction.pdf'
  ): Promise<void> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 15;

      // Encabezado
      doc.setFillColor(30, 30, 50);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('Helvetica', 'bold');
      doc.text('ChurnInsight', 15, 15);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('Reporte de Riesgo de Abandono', 15, 22);
      doc.text(new Date().toLocaleDateString('es-AR'), pageWidth - 15, 22, { align: 'right' });

      currentY = 40;
      doc.setTextColor(0, 0, 0);

      // Sección 1: Perfil de Empresa
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('PERFIL DE EMPRESA', 15, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      const profileData = [
        ['CUIT:', profile?.CUIT || 'N/A'],
        ['Nombre:', profile?.Nombre_Empresa || 'N/A'],
        ['Sector:', profile?.Sector || 'N/A'],
        ['Provincia:', profile?.Provincia || 'N/A']
      ];

      profileData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), 15, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), 50, currentY);
        currentY += 7;
      });

      currentY += 5;

      // Sección 2: Resultado de Predicción (Destacado)
      const riskLevel = result.prevision?.toUpperCase() || 'DESCONOCIDO';
      const probability = (result.probabilidad || 0) * 100;
      const confidence = (result.confidence || 0) * 100;

      const riskColors: Record<string, [number, number, number]> = {
        'ALTO': [220, 38, 38], 'MEDIO': [245, 158, 11], 'BAJO': [34, 197, 94]
      };
      const riskColor = riskColors[riskLevel] || [100, 100, 100];
      
      doc.setFillColor(...riskColor);
      doc.rect(10, currentY - 2, pageWidth - 20, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('Helvetica', 'bold');
      doc.text(`RIESGO ${riskLevel}`, 15, currentY + 8);
      doc.setFontSize(12);
      doc.text(`Probabilidad: ${probability.toFixed(1)}%`, 15, currentY + 16);
      
      currentY += 28;
      doc.setTextColor(0, 0, 0);

      // Sección de métricas en dos columnas
      const col1X = 15;
      const col2X = 110;
      let colY = currentY;

      // Columna 1: Datos Financieros
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('DATOS FINANCIEROS', col1X, colY);
      colY += 8;
      
      doc.setFontSize(9);
      const financialData = [
        [`Ingresos:`, this.formatCurrency(metrics?.financials?.Ingresos)],
        [`Gastos:`, this.formatCurrency(metrics?.financials?.Gastos)],
        [`Margen Neto:`, this.formatCurrency(metrics?.financials?.Margen)],
        [`Deuda Total:`, this.formatCurrency(metrics?.financials?.Deuda)],
        [`Activos:`, this.formatCurrency(metrics?.financials?.Activos)]
      ];
      financialData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), col1X, colY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), col1X + 35, colY);
        colY += 6;
      });

      // Columna 2: Crédito y Engagement
      colY = currentY; // Reset Y for second column
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('MÉTRICAS CLAVE', col2X, colY);
      colY += 8;

      doc.setFontSize(9);
      const creditData = [
        [`Préstamos Aprobados:`, String(metrics?.credit_behavior?.Prestamos_Aprobados || 0)],
        [`Tasa Aprobación:`, `${this.calculateApprovalRate(metrics?.credit_behavior)}%`],
        [`Días Activos (90d):`, `${metrics?.app_engagement?.Trimestre_Dias_Actividad || 0}`],
        [`Servicios Activos:`, `${metrics?.services_flags?.Servicios_Utilizados || 0}/4`]
      ];
      creditData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), col2X, colY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), col2X + 40, colY);
        colY += 6;
      });

      // Actualizar Y a la columna más larga
      currentY = Math.max(colY, currentY + financialData.length * 6 + 15);

      // Salto de página para gráficos si es necesario
      if (currentY > pageHeight - 120 || charts.length > 0) {
        doc.addPage();
        currentY = 20;
      }
      
      // Sección de Gráficos
      if (charts.length > 0) {
        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.text('ANÁLISIS VISUAL', 15, currentY);
        currentY += 10;
        
        const chartWidth = 140; 
        const chartHeight = 80;
        const chartX = (pageWidth - chartWidth) / 2;

        charts.forEach((chart, index) => {
          if (currentY + chartHeight + 20 > pageHeight) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(11);
          doc.setFont('Helvetica', 'bold');
          doc.text(chart.name.toUpperCase(), 15, currentY);
          currentY += 5;

          doc.addImage(chart.image, 'PNG', chartX, currentY, chartWidth, chartHeight);
          currentY += chartHeight + 15;
        });
      }

      // --- PÁGINA 2: ALERTAS Y RECOMENDACIONES ---
      if (result.red_flags?.length || result.recomendaciones?.length) {
        doc.addPage();
        currentY = 20;

        // Sección de Alertas (Red Flags)
        if (result.red_flags && result.red_flags.length > 0) {
          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.text('SEÑALES DE ALERTA (RED FLAGS)', 15, currentY);
          currentY += 10;

          result.red_flags.forEach(flag => {
            const isString = typeof flag === 'string';
            const description = isString ? flag : (flag.description || String(flag.flag));
            const severity = isString ? 'low' : (flag.severity || 'low');

            const severityColors: Record<string, [number, number, number]> = {
              'critical': [220, 38, 38], 'high': [245, 158, 11], 'medium': [234, 179, 8], 'low': [34, 197, 94]
            };
            const color = severityColors[severity];

            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFillColor(...color);
            doc.circle(18, currentY - 1.5, 2, 'F');
            
            doc.setFontSize(10);
            doc.setFont('Helvetica', 'normal');
            const wrappedText = doc.splitTextToSize(description, pageWidth - 35);
            doc.text(wrappedText, 25, currentY);
            currentY += wrappedText.length * 5 + 4;
          });
        }
        
        currentY += 5;

        // Sección de Recomendaciones
        if (result.recomendaciones && result.recomendaciones.length > 0) {
          if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.text('RECOMENDACIONES', 15, currentY);
          currentY += 10;

          result.recomendaciones.forEach(rec => {
            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 20;
            }
            doc.setFillColor(59, 130, 246);
            doc.rect(15, currentY - 3, 1.5, 5, 'F');

            doc.setFontSize(10);
            doc.setFont('Helvetica', 'normal');
            const wrappedText = doc.splitTextToSize(rec, pageWidth - 30);
            doc.text(wrappedText, 20, currentY);
            currentY += wrappedText.length * 5 + 4;
          });
        }
      }

      // Footer en todas las páginas
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('Helvetica', 'italic');
        const footerText = `Confianza del Modelo: ${confidence.toFixed(0)}% | ChurnInsight - Reporte Interno`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Página ${i}/${doc.getNumberOfPages()}`, pageWidth - 20, pageHeight - 10);
      }
      
      doc.save(filename);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el PDF');
    }
  }

  /**
   * Calcula porcentaje de aprobación de créditos
   */
  private calculateApprovalRate(creditBehavior: any): string {
    const solicitados = Number(creditBehavior?.Prestamos_Solicitados) || 0;
    if (solicitados === 0) return '0';
    const aprobados = Number(creditBehavior?.Prestamos_Aprobados) || 0;
    return ((aprobados / solicitados) * 100).toFixed(1);
  }

  /**
   * Calcula porcentaje de actividad
   */
  private calculateActivityRate(appEngagement: any): string {
    const diasActivos = Number(appEngagement?.Trimestre_Dias_Actividad) || 0;
    return ((diasActivos / 90) * 100).toFixed(1);
  }

  /**
   * Formatea número como moneda ARS
   */
  private formatCurrency(value: any): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(num);
  }}