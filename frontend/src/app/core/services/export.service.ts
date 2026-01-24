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

      currentY = 35;
      doc.setTextColor(0, 0, 0);

      // Sección 1: Perfil de Empresa
      doc.setFillColor(240, 240, 245);
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('PERFIL DE EMPRESA', 15, currentY + 2);
      currentY += 12;

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
        currentY += 6;
      });

      currentY += 5;

      // Sección 2: Resultado de Predicción (Destacado)
      const riskLevel = result.prevision?.toUpperCase() || 'DESCONOCIDO';
      const probability = (result.probabilidad || 0) * 100;
      const confidence = (result.confidence || 0) * 100;

      // Caja de riesgo de color
      const riskColors: Record<string, [number, number, number]> = {
        'ALTO': [220, 38, 38],      // Rojo
        'MEDIO': [245, 158, 11],    // Ámbar
        'BAJO': [34, 197, 94]       // Verde
      };

      const riskColor = riskColors[riskLevel] || [100, 100, 100];
      doc.setFillColor(...riskColor);
      doc.rect(10, currentY - 5, pageWidth - 20, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text(`Nivel de Riesgo: ${riskLevel}`, 15, currentY + 5);
      doc.setFontSize(11);
      doc.text(`Probabilidad de Churn: ${probability.toFixed(1)}%`, 15, currentY + 12);
      
      currentY += 25;
      doc.setTextColor(0, 0, 0);

      // Sección 3: Métricas Financieras
      doc.setFillColor(240, 240, 245);
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('DATOS FINANCIEROS', 15, currentY + 2);
      currentY += 12;

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      const financialData = [
        [`Ingresos:`, this.formatCurrency(metrics?.financials?.Ingresos)],
        [`Gastos:`, this.formatCurrency(metrics?.financials?.Gastos)],
        [`Margen Neto:`, this.formatCurrency(metrics?.financials?.Margen)],
        [`Deuda Total:`, this.formatCurrency(metrics?.financials?.Deuda)],
        [`Activos:`, this.formatCurrency(metrics?.financials?.Activos)]
      ];

      financialData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), 15, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), 80, currentY);
        currentY += 5;
      });

      currentY += 3;

      // Sección 4: Comportamiento de Crédito
      doc.setFillColor(240, 240, 245);
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('COMPORTAMIENTO DE CRÉDITO', 15, currentY + 2);
      currentY += 12;

      doc.setFontSize(9);
      const creditData = [
        [`Solicitados:`, String(metrics?.credit_behavior?.Prestamos_Solicitados || 0)],
        [`Aprobados:`, String(metrics?.credit_behavior?.Prestamos_Aprobados || 0)],
        [`Tasa Aprobación:`, `${this.calculateApprovalRate(metrics?.credit_behavior)}%`],
        [`Monto Solicitado:`, this.formatCurrency(metrics?.credit_behavior?.Monto_Solicitado)],
        [`Monto Aprobado:`, this.formatCurrency(metrics?.credit_behavior?.Monto_Aprobado)]
      ];

      creditData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), 15, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), 80, currentY);
        currentY += 5;
      });

      currentY += 3;

      // Sección 5: Engagement en Plataforma
      doc.setFillColor(240, 240, 245);
      doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('ENGAGEMENT EN PLATAFORMA', 15, currentY + 2);
      currentY += 12;

      doc.setFontSize(9);
      const engagementData = [
        [`Días Activos (90):`, `${metrics?.app_engagement?.Trimestre_Dias_Actividad || 0} días`],
        [`Tasa Actividad:`, `${this.calculateActivityRate(metrics?.app_engagement)}%`],
        [`Promedio Logins/Día:`, `${(metrics?.app_engagement?.Promedio_Login_Dia || 0).toFixed(1)}`],
        [`Total Logins:`, String(metrics?.app_engagement?.Total_Login_Dia || 0)]
      ];

      engagementData.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(String(label), 15, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(value), 80, currentY);
        currentY += 5;
      });

      // Si queremos agregar más páginas, hacemos un salto
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 15;
      } else {
        currentY += 8;
      }

      // Sección 6: Banderas Rojas / Recomendaciones
      if (result.red_flags && result.red_flags.length > 0) {
        doc.setFillColor(240, 240, 245);
        doc.rect(10, currentY - 5, pageWidth - 20, 8, 'F');
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text('SEÑALES DE ALERTA', 15, currentY + 2);
        currentY += 12;

        doc.setFontSize(8.5);
        doc.setFont('Helvetica', 'normal');
        result.red_flags.forEach((flag: any) => {
          doc.setTextColor(200, 0, 0);
          doc.text('⚠', 15, currentY);
          doc.setTextColor(0, 0, 0);
          const wrapped = doc.splitTextToSize(String(flag), pageWidth - 25);
          doc.text(wrapped, 22, currentY);
          currentY += wrapped.length * 4 + 1;

          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = 15;
          }
        });

        currentY += 5;
      }

      // Footer con información de confianza
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('Helvetica', 'italic');
      doc.text(
        `Confianza del Modelo: ${confidence.toFixed(0)}% | Generado: ${new Date().toLocaleString('es-AR')}`,
        15,
        pageHeight - 10
      );

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