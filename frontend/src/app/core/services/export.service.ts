import { Injectable } from '@angular/core';
import { 
  PredictionResponse, 
  QuarterlyMetrics, 
  StaticProfile 
} from '../models/churn.interface';
import jsPDF from 'jspdf';

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
   * Exporta a PDF con formato profesional corporativo
   * Muestra SOLO los datos reales del resultado de predicción
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
      let currentY = 10;
      const now = new Date(result.timestamp || new Date());

      // HEADER CORPORATIVO
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('Helvetica', 'bold');
      doc.text('ChurnInsight', 15, 16);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('Reporte de Evaluacion de Riesgo de Abandono', 15, 24);
      
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 200);
      doc.text(`Generado: ${now.toLocaleDateString('es-AR')} | ${now.toLocaleTimeString('es-AR')}`, 15, 31);
      
      currentY = 48;
      doc.setTextColor(0, 0, 0);

      // SECCION 1: RESUMEN EJECUTIVO - Datos reales del resultado
      const prob = Number(result.churn_probability) || 0;
      const conf = Number(result.confidence) || 0.95;
      const threshold = Number(result.threshold_used) || 0.5;
      const probPercentage = prob > 1 ? prob : prob * 100;
      
      // Usar la MISMA lógica del modal para calcular nivel de riesgo
      let riskColor: [number, number, number];
      let riskLabel: string;
      
      if (probPercentage >= 66) {
        riskColor = [220, 38, 38];
        riskLabel = 'ALTO';
      } else if (probPercentage >= 33) {
        riskColor = [245, 158, 11];
        riskLabel = 'MEDIO';
      } else {
        riskColor = [34, 197, 94];
        riskLabel = 'BAJO';
      }
      
      doc.setFillColor(240, 245, 250);
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.rect(10, currentY, pageWidth - 20, 35);
      
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('EVALUACION DE RIESGO', 15, currentY + 6);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Empresa: ${result.NOMBRE_EMPRESA || profile?.Nombre_Empresa || 'N/A'}`, 15, currentY + 14);
      doc.text(`CUIT: ${result.CUIT || profile?.CUIT || 'N/A'}`, 15, currentY + 20);
      const predictionLabel = Number(result.churn_prediction) === 1 ? 'CHURN PROBABLE' : 'CLIENTE ACTIVO';
      doc.text(`Prediccion: ${predictionLabel}`, 15, currentY + 26);
      
      const [r1, g1, b1] = riskColor;
      doc.setFillColor(r1, g1, b1);
      doc.rect(pageWidth - 55, currentY + 6, 45, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(riskLabel, pageWidth - 45, currentY + 15);
      
      currentY += 42;

      // SECCION 2: METRICAS CLAVE DEL RESULTADO
      const redFlagCount = (result.red_flags?.length || 0);
      const isChurn = Number(result.churn_prediction) === 1;
      const predictionColor = isChurn ? [220, 38, 38] : [34, 197, 94];
      const alertColor = redFlagCount > 0 ? [239, 68, 68] : [34, 197, 94];
      const metricsTop = [
        { label: 'Probabilidad', value: `${probPercentage.toFixed(1)}%`, color: riskColor },
        { label: 'Umbral', value: `${(threshold * 100).toFixed(0)}%`, color: [107, 114, 128] as [number, number, number] },
        { label: 'Prediccion', value: isChurn ? 'CHURN' : 'ACTIVO', color: predictionColor as [number, number, number] },
        { label: 'Alertas', value: `${redFlagCount}`, color: alertColor as [number, number, number] }
      ];
      
      const metricBoxWidth = (pageWidth - 30) / 4;
      metricsTop.forEach((metric, idx) => {
        const x = 10 + idx * (metricBoxWidth + 2.5);
        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(220, 220, 220);
        doc.rect(x, currentY, metricBoxWidth, 24);
        
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(metric.label, x + 2, currentY + 5);
        
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        const [r, g, b] = metric.color;
        doc.setTextColor(r, g, b);
        doc.text(metric.value, x + 2, currentY + 16);
      });
      
      currentY += 30;

      // SECCION 3: INFORMACION DE LA EMPRESA
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('INFORMACION DE LA EMPRESA', 10, currentY + 1);
      currentY += 6;
      
      const companyData = [
        { label: 'Nombre', value: result.NOMBRE_EMPRESA || profile?.Nombre_Empresa || 'N/A' },
        { label: 'CUIT', value: result.CUIT || profile?.CUIT || 'N/A' },
        { label: 'Sector', value: profile?.Sector || 'N/A' },
        { label: 'Provincia', value: profile?.Provincia || 'N/A' }
      ];
      
      const colWidth = (pageWidth - 20) / 2;
      for (let i = 0; i < companyData.length; i += 2) {
        const row = [companyData[i], companyData[i + 1]];
        row.forEach((metric, colIdx) => {
          const x = 10 + colIdx * (colWidth + 2.5);
          doc.setFillColor(247, 250, 252);
          doc.setDrawColor(200, 215, 230);
          doc.setLineWidth(0.5);
          doc.rect(x, currentY, colWidth, 16);
          
          doc.setFontSize(9);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text(metric.label, x + 3, currentY + 5);
          
          doc.setFontSize(10);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          const val = metric.value ? String(metric.value).substring(0, 25) : 'N/A';
          doc.text(val, x + 3, currentY + 12);
        });
        currentY += 18;
      }
      
      currentY += 2;

      // SECCION 4: DETALLE COMPLETO DE DATOS (Grid Layout)
      if (metrics) {
        // Título de sección
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('DETALLE DE DATOS INGRESADOS', 10, currentY + 1);
        currentY += 6;

        // Definir grupos de datos
        const groups = [
          {
            title: 'ESTRUCTURA FINANCIERA',
            color: [240, 253, 244], // green-50
            borderColor: [187, 247, 208], // green-200
            items: [
              { label: 'Ingresos', value: this.formatCurrency(metrics.financials?.Ingresos) },
              { label: 'Gastos', value: this.formatCurrency(metrics.financials?.Gastos) },
              { label: 'Margen Operativo', value: this.formatCurrency(metrics.financials?.Margen) },
              { label: 'Deuda Total', value: this.formatCurrency(metrics.financials?.Deuda) },
              { label: 'Activos Totales', value: this.formatCurrency(metrics.financials?.Activos) }
            ]
          },
          {
            title: 'COMPORTAMIENTO CREDITICIO',
            color: [239, 246, 255], // blue-50
            borderColor: [191, 219, 254], // blue-200
            items: [
              { label: 'Prestamos Solicitados', value: String(metrics.credit_behavior?.Prestamos_Solicitados || 0) },
              { label: 'Prestamos Aprobados', value: String(metrics.credit_behavior?.Prestamos_Aprobados || 0) },
              { label: 'Prestamos Vigentes', value: String(metrics.credit_behavior?.Prestamos_Vigentes || 0) },
              { label: 'Monto Solicitado', value: this.formatCurrency(metrics.credit_behavior?.Monto_Solicitado) },
              { label: 'Monto Aprobado', value: this.formatCurrency(metrics.credit_behavior?.Monto_Aprobado) },
              { label: 'Ticket Prom. Solic.', value: this.formatCurrency(metrics.credit_behavior?.Ticket_Promedio_Solicitado) },
              { label: 'Tiempo Cancelacion', value: `${metrics.credit_behavior?.Tiempo_Cancelacion_Prestamo || 0} dias` }
            ]
          },
          {
            title: 'ENGAGEMENT & SERVICIOS',
            color: [255, 251, 235], // amber-50
            borderColor: [253, 230, 138], // amber-200
            items: [
              { label: 'Dias Activos (Trim)', value: `${metrics.app_engagement?.Trimestre_Dias_Actividad || 0} / 90` },
              { label: 'Dias Inactivos', value: `${metrics.app_engagement?.Trimestre_Dias_Inactividad || 0}` },
              { label: 'Logins Totales', value: String(metrics.app_engagement?.Total_Login_Dia || 0) },
              { label: 'Promedio Diario', value: (metrics.app_engagement?.Promedio_Login_Dia || 0).toFixed(1) },
              { label: 'Servicios Usados', value: `${metrics.services_flags?.Servicios_Utilizados || 0} / 4` },
              { label: 'Transferencias', value: metrics.services_flags?.Transferencias ? 'SI' : 'NO' },
              { label: 'Pagos / Inversiones', value: (metrics.services_flags?.Pagos || metrics.services_flags?.Inversiones) ? 'SI' : 'NO' }
            ]
          }
        ];

        // Renderizar grupos en columnas
        const colWidth = (pageWidth - 25) / 3;
        let maxHeight = 0;

        groups.forEach((group, idx) => {
          const x = 10 + idx * (colWidth + 2.5);
          let y = currentY;

          // Header del grupo
          doc.setFillColor(...(group.color as [number, number, number]));
          doc.setDrawColor(...(group.borderColor as [number, number, number]));
          doc.setLineWidth(0.5);
          
          // Calcular altura necesaria
          const boxHeight = 8 + (group.items.length * 7);
          if (boxHeight > maxHeight) maxHeight = boxHeight;

          doc.rect(x, y, colWidth, boxHeight, 'FD');

          // Título
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(70, 80, 90);
          doc.text(group.title, x + 3, y + 5);
          
          // Línea separadora
          doc.setDrawColor(...(group.borderColor as [number, number, number]));
          doc.line(x, y + 7, x + colWidth, y + 7);

          y += 11;

          // Items
          group.items.forEach(item => {
            // Label
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text(item.label, x + 3, y);

            // Value
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(30, 40, 50);
            doc.text(item.value, x + colWidth - 3, y, { align: 'right' });

            y += 7;
          });
        });

        currentY += maxHeight + 5;
      }

      // GRÁFICAS
      if (charts.length > 0) {
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('ANALISIS VISUAL', 15, currentY);
        currentY += 8;

        const chartWidth = 170;
        const chartHeight = 70;
        const chartX = (pageWidth - chartWidth) / 2;

        charts.forEach((chart) => {
          if (currentY + chartHeight + 15 > pageHeight) {
            doc.addPage();
            currentY = 15;
          }

          doc.setFontSize(11);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(60, 80, 110);
          doc.text(chart.name, 15, currentY);
          currentY += 5;

          doc.setDrawColor(220, 220, 220);
          doc.rect(chartX - 5, currentY - 2, chartWidth + 10, chartHeight + 4);

          try {
            doc.addImage(chart.image, 'PNG', chartX, currentY, chartWidth, chartHeight);
          } catch (e) {
            console.warn('No se pudo insertar grafica');
          }
          currentY += chartHeight + 8;
        });
      }

      // PÁGINA 2: ALERTAS Y RECOMENDACIONES (si existen)
      if (result.red_flags?.length || result.recomendaciones?.length) {
        doc.addPage();
        currentY = 20;

        if (result.red_flags && result.red_flags.length > 0) {
          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('SENALES DE ALERTA DETECTADAS', 15, currentY);
          currentY += 8;

          const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          const sorted = [...(result.red_flags || [])].sort((a, b) => {
            const sA = typeof a === 'string' ? 'low' : (a.severity || 'low');
            const sB = typeof b === 'string' ? 'low' : (b.severity || 'low');
            return (severityOrder[sA] || 999) - (severityOrder[sB] || 999);
          });

          sorted.forEach(flag => {
            const isStr = typeof flag === 'string';
            const desc = isStr ? flag : (flag.description || String(flag.flag));
            const sev = isStr ? 'low' : (flag.severity || 'low');

            const severityConfig: Record<string, { color: [number, number, number], label: string }> = {
              'critical': { color: [220, 38, 38], label: 'CRITICO' },
              'high': { color: [245, 158, 11], label: 'ALTO' },
              'medium': { color: [234, 179, 8], label: 'MEDIO' },
              'low': { color: [34, 197, 94], label: 'BAJO' }
            };
            const cfg = severityConfig[sev] || { color: [100, 100, 100], label: 'INFO' };

            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 15;
            }

            const [cr, cg, cb] = cfg.color;
            doc.setFillColor(cr, cg, cb);
            doc.rect(10, currentY - 2, 2, 5, 'F');

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            const wrapped = doc.splitTextToSize(desc, pageWidth - 35);
            doc.text(wrapped, 15, currentY);
            
            doc.setFillColor(cr, cg, cb);
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(7);
            doc.text(cfg.label, pageWidth - 20, currentY + 1);
            
            currentY += wrapped.length * 4 + 3;
          });
        }

        currentY += 5;

        if (result.recomendaciones && result.recomendaciones.length > 0) {
          if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 15;
          }

          doc.setFontSize(14);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text('RECOMENDACIONES PRIORITARIAS', 15, currentY);
          currentY += 8;

          result.recomendaciones.forEach((rec, idx) => {
            if (currentY > pageHeight - 15) {
              doc.addPage();
              currentY = 15;
            }

            doc.setFillColor(59, 130, 246);
            doc.circle(16, currentY - 1, 1.5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(String(idx + 1), 15.2, currentY + 0.5);

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            const wrapped = doc.splitTextToSize(rec, pageWidth - 30);
            doc.text(wrapped, 22, currentY);
            currentY += wrapped.length * 4 + 3;
          });
        }
      }

      // FOOTER
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(220, 220, 220);
        doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('Helvetica', 'italic');
        
        const footerText = `ChurnInsight | Prediccion: ${result.churn_prediction} | ${now.toLocaleDateString('es-AR')}`;
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