import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  PredictionRequest, 
  PredictionResponse, 
  QuarterlyMetrics 
} from '../models/churn.interface';

/**
 * PredictionService
 * Servicio de integración con el backend de predicción de churn
 * 
 * Responsabilidades:
 * - Enviar datos financieros y de engagement al modelo ML
 * - Procesar respuestas y retornar predicciones de riesgo
 * - Gestionar transformación de datos para el backend
 */
@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly PREDICTION_DELAY_MS = 1500; // Simula latencia de backend

  constructor() {}

  /**
   * Realiza predicción de churn basada en métricas trimestrales
   * 
   * @param data - Métricas de un trimestre (financials, engagement, etc.)
   * @returns Observable<PredictionResponse> con resultado de predicción
   * 
   * Contrato de respuesta:
   * {
   *   prevision: 'alto' | 'medio' | 'bajo',
   *   probabilidad: 0-1,
   *   confidence?: number,
   *   recomendaciones?: string[]
   * }
   */
  predict(data: QuarterlyMetrics): Observable<PredictionResponse> {
    // Validación básica
    if (!data || !data.financials || !data.app_engagement) {
      return this._handleError('Datos de entrada incompletos');
    }

    // Aquí iría la llamada real al backend:
    // return this.http.post<PredictionResponse>('/api/predict', request);

    // Por ahora: Mock con delay de 1.5s y lógica aleatoria
    return this._mockPrediction(data).pipe(
      delay(this.PREDICTION_DELAY_MS),
      map(response => ({
        ...response,
        confidence: Math.random() * 0.4 + 0.6 // 60-100% confianza
      }))
    );
  }

  /**
   * Mock interno: Genera predicción aleatoria basada en métricas
   * Lógica simplificada para demostración
   */
  private _mockPrediction(data: QuarterlyMetrics): Observable<PredictionResponse> {
    const risk = this._calculateRiskScore(data);
    
    let prevision: 'alto' | 'medio' | 'bajo';
    let probabilidad: number;

    if (risk > 0.7) {
      prevision = 'alto';
      probabilidad = 0.6 + Math.random() * 0.4; // 60-100%
    } else if (risk > 0.4) {
      prevision = 'medio';
      probabilidad = 0.3 + Math.random() * 0.4; // 30-70%
    } else {
      prevision = 'bajo';
      probabilidad = Math.random() * 0.3; // 0-30%
    }

    const response: PredictionResponse = {
      prevision,
      probabilidad: Math.round(probabilidad * 100) / 100,
      recomendaciones: this._generateRecommendations(data, prevision)
    };

    return of(response);
  }

  /**
   * Calcula score de riesgo (0-1) basado en métricas
   * Mayor score = Mayor riesgo de churn
   */
  private _calculateRiskScore(data: QuarterlyMetrics): number {
    let score = 0;

    // Factor 1: Engagement bajo (inactividad alta)
    const activityRatio = data.app_engagement.Trimestre_Dias_Actividad / 90;
    if (activityRatio < 0.3) score += 0.3;
    else if (activityRatio < 0.6) score += 0.15;

    // Factor 2: Margen negativo o bajo
    if (data.financials.Margen < 0) score += 0.3;
    else if (data.financials.Margen < data.financials.Ingresos * 0.1) score += 0.15;

    // Factor 3: Deuda alta respecto a activos
    if (data.financials.Deuda > 0 && data.financials.Activos > 0) {
      const debtRatio = data.financials.Deuda / data.financials.Activos;
      if (debtRatio > 0.5) score += 0.2;
    }

    // Factor 4: Pocas solicitudes o bajas aprobaciones
    if (data.credit_behavior.Prestamos_Solicitados === 0) score += 0.15;
    else {
      const approvalRate = data.credit_behavior.Prestamos_Aprobados / 
                          data.credit_behavior.Prestamos_Solicitados;
      if (approvalRate < 0.3) score += 0.15;
    }

    // Factor 5: Pocos servicios utilizados
    if (data.services_flags.Servicios_Utilizados < 2) score += 0.1;

    return Math.min(score, 1); // Máximo 1
  }

  /**
   * Genera recomendaciones basadas en el riesgo y métricas
   */
  private _generateRecommendations(
    data: QuarterlyMetrics, 
    prevision: string
  ): string[] {
    const recommendations: string[] = [];

    if (prevision === 'alto') {
      recommendations.push('Contacto prioritario con account manager');
      if (data.app_engagement.Trimestre_Dias_Actividad < 30) {
        recommendations.push('Reactivar uso de plataforma mediante webinar o capacitación');
      }
      if (data.financials.Margen < 0) {
        recommendations.push('Análisis de rentabilidad y ajuste de servicios');
      }
    }

    if (data.credit_behavior.Prestamos_Vigentes === 0) {
      recommendations.push('Ofrecer línea de crédito con tasa preferencial');
    }

    if (data.services_flags.Servicios_Utilizados < 3) {
      recommendations.push('Onboarding para servicios de inversión o transferencias');
    }

    return recommendations.length > 0 ? recommendations : ['Continuar monitoreo regular'];
  }

  /**
   * Manejo centralizado de errores
   */
  private _handleError(message: string): Observable<PredictionResponse> {
    console.error(`[PredictionService Error] ${message}`);
    return of({
      prevision: 'medio',
      probabilidad: 0.5,
      recomendaciones: ['Error en predicción. Reintentar.']
    });
  }
}
