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
   * Incluye estadísticas visuales, gráficos de riesgo e imágenes de gráficas
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

      // ============================================================================
      // PÁGINA 1: PORTADA Y RESULTADO PRINCIPAL
      // ============================================================================
      
      // Encabezado elegante con gradiente (simulado con rectángulos)
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('Helvetica', 'bold');
      doc.text('ChurnInsight', 15, 18);
      
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'normal');
      doc.text('Reporte de Análisis de Riesgo de Abandono', 15, 28);
      
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`${new Date().toLocaleDateString('es-AR')} - ${new Date().toLocaleTimeString('es-AR')}`, 15, 36);

      currentY = 55;
      doc.setTextColor(0, 0, 0);

      // SECCIÓN: Perfil de Empresa
      doc.setFillColor(240, 246, 252);
      doc.rect(10, currentY - 2, pageWidth - 20, 30, 'F');
      
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('INFORMACIÓN DE LA EMPRESA', 15, currentY + 4);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      const companyInfo = [
        { label: 'Empresa:', value: profile?.Nombre_Empresa || 'N/A' },
        { label: 'CUIT:', value: profile?.CUIT || 'N/A' },
        { label: 'Sector:', value: profile?.Sector || 'N/A' },
        { label: 'Provincia:', value: profile?.Provincia || 'N/A' }
      ];
      
      let infoY = currentY + 10;
      companyInfo.slice(0, 2).forEach((info, idx) => {
        const x = idx === 0 ? 15 : pageWidth / 2;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(60, 80, 110);
        doc.text(`${info.label}`, x, infoY);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(String(info.value), x + 25, infoY);
      });
      
      infoY += 7;
      companyInfo.slice(2).forEach((info, idx) => {
        const x = idx === 0 ? 15 : pageWidth / 2;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(60, 80, 110);
        doc.text(`${info.label}`, x, infoY);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(String(info.value), x + 25, infoY);
      });

      currentY += 35;

      // SECCION: RESULTADO PRINCIPAL DESTACADO
      const riskLevel = result.prevision?.toUpperCase() || 'DESCONOCIDO';
      const probability = (result.probabilidad || 0) * 100;
      const confidence = (result.confidence || 0) * 100;

      const riskColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
        'ALTO': { bg: [220, 38, 38], text: [178, 0, 0] },
        'MEDIO': { bg: [245, 158, 11], text: [180, 83, 9] },
        'BAJO': { bg: [34, 197, 94], text: [5, 150, 105] }
      };
      const riskStyle = riskColors[riskLevel] || { bg: [100, 100, 100], text: [50, 50, 50] };
      
      doc.setFillColor(...riskStyle.bg);
      doc.roundedRect(10, currentY, pageWidth - 20, 35, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('Helvetica', 'bold');
      doc.text(`RIESGO: ${riskLevel}`, 15, currentY + 12);
      
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Probabilidad de Churn: ${probability.toFixed(1)}%`, 15, currentY + 23);
      
      doc.setFontSize(11);
      doc.text(`Confianza del Modelo: ${confidence.toFixed(0)}%`, 15, currentY + 31);
      
      currentY += 40;

      // SECCIÓN: PREDICCIÓN Y CONFIANZA (2 columnas)
      const boxWidth = (pageWidth - 30) / 2;
      const boxHeight = 20;
      
      // Predicción
      const isChurn = Number(result.churn_prediction) === 1 || String(result.churn_prediction).toUpperCase() === 'YES';
      const predBg: [number, number, number] = isChurn ? [254, 242, 242] : [240, 253, 244];
      const predText: [number, number, number] = isChurn ? [220, 38, 38] : [34, 197, 94];
      
      doc.setFillColor(...predBg);
      doc.rect(10, currentY, boxWidth, boxHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(10, currentY, boxWidth, boxHeight);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('PREDICCIÓN', 14, currentY + 4);
      
      doc.setFontSize(16);
      doc.setTextColor(...predText);
      doc.text(isChurn ? 'CHURN' : 'ACTIVO', 14, currentY + 15);
      
      // Confianza
      const confBg: [number, number, number] = [240, 245, 250];
      const confText: [number, number, number] = [59, 130, 246];
      doc.setFillColor(...confBg);
      doc.rect(10 + boxWidth + 10, currentY, boxWidth, boxHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(10 + boxWidth + 10, currentY, boxWidth, boxHeight);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('CONFIANZA', 14 + boxWidth + 10, currentY + 4);
      
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text(`${confidence.toFixed(0)}%`, 14 + boxWidth + 10, currentY + 15);
      
      currentY += 25;

      // SECCIÓN: MÉTRICAS CLAVE (Grid 2x2)
      const metricBoxes = [
        {
          label: 'Ingresos',
          value: this.formatCurrency(metrics?.financials?.Ingresos),
          icon: '💰'
        },
        {
          label: 'Gastos',
          value: this.formatCurrency(metrics?.financials?.Gastos),
          icon: '📊'
        },
        {
          label: 'Deuda Total',
          value: this.formatCurrency(metrics?.financials?.Deuda),
          icon: '💳'
        },
        {
          label: 'Margen Neto',
          value: this.formatCurrency(metrics?.financials?.Margen),
          icon: '📈'
        }
      ];

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('METRICAS FINANCIERAS', 15, currentY);
      currentY += 5;

      metricBoxes.forEach((metric, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const x = 10 + col * (pageWidth / 2);
        const y = currentY + row * 15;

        doc.setFillColor(250, 250, 252);
        doc.rect(x, y, pageWidth / 2 - 10, 12, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(x, y, pageWidth / 2 - 10, 12);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`${metric.icon} ${metric.label}`, x + 2, y + 4);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text(String(metric.value), x + 2, y + 10);
      });

      currentY += 35;

      // SECCIÓN: COMPORTAMIENTO DE CREDITO Y ACTIVIDAD
      const behaviorMetrics = [
        {
          label: 'Prestamos Solicitados',
          value: String(metrics?.credit_behavior?.Prestamos_Solicitados || 0),
          icon: '📋'
        },
        {
          label: 'Prestamos Aprobados',
          value: String(metrics?.credit_behavior?.Prestamos_Aprobados || 0),
          icon: '✅'
        },
        {
          label: 'Dias Activos (90d)',
          value: `${metrics?.app_engagement?.Trimestre_Dias_Actividad || 0}d`,
          icon: '⏱️'
        },
        {
          label: 'Tasa Aprobacion',
          value: `${this.calculateApprovalRate(metrics?.credit_behavior)}%`,
          icon: '📊'
        }
      ];

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('COMPORTAMIENTO DE CREDITO', 15, currentY);
      currentY += 5;

      behaviorMetrics.forEach((metric, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const x = 10 + col * (pageWidth / 2);
        const y = currentY + row * 15;

        doc.setFillColor(245, 250, 255);
        doc.rect(x, y, pageWidth / 2 - 10, 12, 'F');
        doc.setDrawColor(200, 220, 255);
        doc.rect(x, y, pageWidth / 2 - 10, 12);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`${metric.icon} ${metric.label}`, x + 2, y + 4);

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text(String(metric.value), x + 2, y + 10);
      });

      currentY += 35;

      // ============================================================================
      // GRÁFICAS EN LA PRIMERA PÁGINA O NUEVA PÁGINA
      // ============================================================================
      if (charts.length > 0) {
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('ANÁLISIS VISUAL', 15, currentY);
        currentY += 8;

        const chartWidth = 170;
        const chartHeight = 70;
        const chartX = (pageWidth - chartWidth) / 2;

        charts.forEach((chart, index) => {
          if (currentY + chartHeight + 15 > pageHeight) {
            doc.addPage();
            currentY = 15;
          }

          // Nombre del gráfico
          doc.setFontSize(11);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(60, 80, 110);
          doc.text(chart.name, 15, currentY);
          currentY += 5;

          // Marco del gráfico
          doc.setDrawColor(220, 220, 220);
          doc.rect(chartX - 5, currentY - 2, chartWidth + 10, chartHeight + 4);

          // Insertar imagen del gráfico
          try {
            doc.addImage(chart.image, 'PNG', chartX, currentY, chartWidth, chartHeight);
          } catch (e) {
            console.warn('No se pudo insertar gráfica:', chart.name);
          }
          currentY += chartHeight + 8;
        });
      }

      // ============================================================================
      // PÁGINA 2: ALERTAS Y RECOMENDACIONES
      // ============================================================================
      if (result.red_flags?.length || result.recomendaciones?.length) {
        doc.addPage();
        currentY = 20;

        // Seccion de Alertas (Red Flags)
        if (result.red_flags && result.red_flags.length > 0) {
          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('Senales de Alerta', 15, currentY);
          currentY += 8;

          // Ordenar red flags por severidad (critical -> high -> medium -> low)
          const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          const sortedFlags = [...(result.red_flags || [])].sort((a, b) => {
            const severityA = typeof a === 'string' ? 'low' : (a.severity || 'low');
            const severityB = typeof b === 'string' ? 'low' : (b.severity || 'low');
            return (severityOrder[severityA] || 999) - (severityOrder[severityB] || 999);
          });

          sortedFlags.forEach(flag => {
            const isString = typeof flag === 'string';
            const description = isString ? flag : (flag.description || String(flag.flag));
            const severity = isString ? 'low' : (flag.severity || 'low');

            const severityConfig: Record<string, { color: [number, number, number], label: string }> = {
              'critical': { color: [220, 38, 38], label: 'CRITICO' },
              'high': { color: [245, 158, 11], label: 'ALTO' },
              'medium': { color: [234, 179, 8], label: 'MEDIO' },
              'low': { color: [34, 197, 94], label: 'BAJO' }
            };
            const config = severityConfig[severity] || { color: [100, 100, 100], label: 'INFO' };

            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 15;
            }

            // Barra de color
            doc.setFillColor(...config.color);
            doc.rect(10, currentY - 2, 2, 5, 'F');

            // Texto
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            const wrappedText = doc.splitTextToSize(description, pageWidth - 35);
            doc.text(wrappedText, 15, currentY);
            
            // Severity badge
            doc.setFillColor(...config.color);
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(7);
            doc.text(config.label, pageWidth - 20, currentY + 1);
            
            currentY += wrappedText.length * 4 + 3;
          });
        }

        currentY += 5;

        // Seccion de Recomendaciones
        if (result.recomendaciones && result.recomendaciones.length > 0) {
          if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 15;
          }

          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('Recomendaciones', 15, currentY);
          currentY += 8;

          result.recomendaciones.forEach((rec, idx) => {
            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 15;
            }

            // Numero en circulo
            doc.setFillColor(59, 130, 246);
            doc.circle(16, currentY - 1, 1.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(String(idx + 1), 15.2, currentY + 0.5);

            // Texto de recomendacion
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            const wrappedText = doc.splitTextToSize(rec, pageWidth - 30);
            doc.text(wrappedText, 22, currentY);
            currentY += wrappedText.length * 4 + 3;
          });
        }
      }

      // ============================================================================
      // FOOTER EN TODAS LAS PÁGINAS
      // ============================================================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Línea separadora
        doc.setDrawColor(220, 220, 220);
        doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('Helvetica', 'italic');
        
        const footerText = `ChurnInsight | Confianza: ${confidence.toFixed(0)}% | Fecha: ${new Date().toLocaleDateString('es-AR')}`;
        doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
        
        doc.setFont('Helvetica', 'normal');
        doc.text(`Pág. ${i}/${totalPages}`, pageWidth - 15, pageHeight - 8);
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