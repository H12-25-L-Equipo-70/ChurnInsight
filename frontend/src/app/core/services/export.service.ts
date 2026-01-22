import { Injectable } from '@angular/core';
import { 
  PredictionResponse, 
  QuarterlyMetrics, 
  StaticProfile 
} from '../models/churn.interface';

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
Nivel de Riesgo,${result?.prevision?.toUpperCase() || 'N/A'}
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

Nivel de Riesgo: ${result?.prevision?.toUpperCase() || 'N/A'}
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
    const riskLevel = result.prevision.charAt(0).toUpperCase() + 
                      result.prevision.slice(1);
    const probability = (result.probabilidad * 100).toFixed(1);

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
}
