import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { 
  PredictionRequest, 
  PredictionResponse, 
  QuarterlyMetrics,
  EmpresaInput 
} from '../models/churn.interface';
import { DebugService } from './debug.service';

/**
 * PredictionService
 * Integración real con los endpoints del AI Service y Backend
 * 
 * Responsabilidades:
 * - Enviar datos a /api/v1/predictions/predict_churn (AI Service)
 * - Transformar QuarterlyMetrics → EmpresaInput (30 campos)
 * - Gestionar errores HTTP y timeouts
 * - Mantener backwards compatibility con antiguo formato
 */
@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly http = inject(HttpClient);
  private readonly debug = inject(DebugService);
  private readonly AI_SERVICE_URL = 'http://152.67.34.202:8000/api/v1/predictions/predict_churn';
  private readonly REQUEST_TIMEOUT_MS = 30000; // 30 segundos

  /**
   * Realiza predicción de churn contra el AI Service en tiempo real
   * 
   * @param data - Métricas trimestrales
   * @param cuit - CUIT de la empresa
   * @param nombreEmpresa - Nombre de la empresa
   * @param sector - Sector de la empresa
   * @param provincia - Provincia de la empresa
   * @returns Observable<PredictionResponse> con predicción real del modelo
   */
  predict(
    data: QuarterlyMetrics,
    cuit: string,
    nombreEmpresa: string,
    sector: string,
    provincia: string
  ): Observable<PredictionResponse> {
    // Validar datos de entrada
    if (!this._validateInputData(data)) {
      return this._handleError('Datos de entrada incompletos o inválidos');
    }

    // Transformar formato local → EmpresaInput (30 campos)
    const empresaInput = this._mapToEmpresaInput(
      data,
      cuit,
      nombreEmpresa,
      sector,
      provincia
    );

    // DEBUG: Log del request
    this.debug.logRequest('Predicción de Churn', this.AI_SERVICE_URL, empresaInput);

    // Llamada HTTP real al AI Service
    return this.http.post<PredictionResponse>(
      this.AI_SERVICE_URL,
      empresaInput
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => {
        // DEBUG: Log del response raw
        this.debug.logResponse('Response Raw del AI Service', response);
        
        // Validar que tenga los campos esperados
        const validation = this.debug.validatePredictionResponse(response);
        if (!validation.valid) {
          console.warn(`⚠️ Campos faltantes: ${validation.missingFields.join(', ')}`);
        }
        
        return this._normalizeResponse(response);
      }),
      catchError(error => {
        this.debug.logError('Error en Predicción', error);
        return this._handleHttpError(error);
      })
    );
  }

  /**
   * Batch prediction - procesa múltiples empresas
   * 
   * @param requests - Array de requests con datos y metadatos
   * @returns Observable<PredictionResponse[]>
   */
  batchPredict(
    requests: Array<{
      data: QuarterlyMetrics;
      cuit: string;
      nombreEmpresa: string;
      sector: string;
      provincia: string;
    }>
  ): Observable<PredictionResponse[]> {
    // Construir payload para batch endpoint
    const empresaInputs = requests.map(req =>
      this._mapToEmpresaInput(
        req.data,
        req.cuit,
        req.nombreEmpresa,
        req.sector,
        req.provincia
      )
    );

    return this.http.post<PredictionResponse[]>(
      'http://152.67.34.202:8000/api/v1/predictions/batch_predict_churn',
      { data: empresaInputs }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(responses => responses.map(r => this._normalizeResponse(r))),
      catchError(error => this._handleHttpError(error))
    );
  }

  /**
   * Transforma QuarterlyMetrics → EmpresaInput (30+ campos)
   * Mapeo completo entre formatos
   */
  private _mapToEmpresaInput(
    data: QuarterlyMetrics,
    cuit: string,
    nombreEmpresa: string,
    sector: string,
    provincia: string
  ): EmpresaInput {
    // Generar PERIODO_FISCAL en formato YYYY-Q#
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const periodeFiscal = `${now.getFullYear()}-Q${quarter}`;

    return {
      // Identificación
      CUIT: cuit,
      NOMBRE_EMPRESA: nombreEmpresa,
      PERIODO_FISCAL: periodeFiscal,
      
      // Financials (5 campos)
      INGRESOS: data.financials.Ingresos || 0,
      GASTOS: data.financials.Gastos || 0,
      DEUDA: data.financials.Deuda || 0,
      ACTIVOS: data.financials.Activos || 0,
      
      // Credit Behavior (9 campos)
      PRESTAMOS_SOLICITADOS: data.credit_behavior.Prestamos_Solicitados || 0,
      PRESTAMOS_APROBADOS: data.credit_behavior.Prestamos_Aprobados || 0,
      PRESTAMOS_CANCELADOS: data.credit_behavior.Prestamos_Cancelados || 0,
      PRESTAMOS_VIGENTES: data.credit_behavior.Prestamos_Vigentes || 0,
      TICKET_PROMEDIO_SOLICITADO: data.credit_behavior.Ticket_Promedio_Solicitado || 0,
      TICKET_PROMEDIO_APROBADO: data.credit_behavior.Ticket_Promedio_Aprobado || 0,
      MONTO_SOLICITADO: data.credit_behavior.Monto_Solicitado || 0,
      MONTO_APROBADO: data.credit_behavior.Monto_Aprobado || 0,
      TIEMPO_CANCELACION_PRESTAMO: data.credit_behavior.Tiempo_Cancelacion_Prestamo || 0,
      
      // Services Flags - IMPORTANTE: Convertir booleanos a números (0 o 1)
      TRANSFERENCIAS: data.services_flags.Transferencias ? 1 : 0,
      PAGOS: data.services_flags.Pagos ? 1 : 0,
      CREDITOS: data.services_flags.Creditos ? 1 : 0,
      INVERSIONES: data.services_flags.Inversiones ? 1 : 0,
      SERVICIOS_UTILIZADOS: data.services_flags.Servicios_Utilizados || 0,
      
      // App Engagement (4 campos)
      TRIMESTRE_DIAS_ACTIVIDAD: data.app_engagement.Trimestre_Dias_Actividad || 0,
      TRIMESTRE_DIAS_INACTIVIDAD: data.app_engagement.Trimestre_Dias_Inactividad || 0,
      PROMEDIO_LOGIN_DIA: data.app_engagement.Promedio_Login_Dia || 0,
      TOTAL_LOGIN_DIA: data.app_engagement.Total_Login_Dia || 0
    };
  }

  /**
   * Normaliza respuesta del AI Service para compatibilidad con UI
   * Añade campos legacy si no existen
   */
  private _normalizeResponse(response: PredictionResponse): PredictionResponse {
    // Si la respuesta no tiene campos legacy, generarlos
    if (!response.prevision) {
      const isPredictionYes = response.churn_prediction === 'YES';
      const probability = this._normalizeProbability(response.churn_probability);
      
      response.prevision = probability > 0.7 ? 'alto' : probability > 0.4 ? 'medio' : 'bajo';
      response.probabilidad = probability;
    }

    // Asegurar que churn_probability esté en rango 0-1
    response.churn_probability = this._normalizeProbability(response.churn_probability);

    // Generar recomendaciones si no existen
    if (!response.recomendaciones || response.recomendaciones.length === 0) {
      response.recomendaciones = this._generateRecommendations(response);
    }

    return response;
  }

  /**
   * Normaliza probabilidad a rango 0-1
   * Maneja casos donde podría estar en 0-100
   */
  private _normalizeProbability(probability: number): number {
    if (probability > 1) {
      return probability / 100;
    }
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Genera recomendaciones basadas en red_flags y probabilidad
   */
  private _generateRecommendations(response: PredictionResponse): string[] {
    const recommendations: string[] = [];
    const probability = this._normalizeProbability(response.churn_probability);

    if (probability > 0.7) {
      recommendations.push('⚠️ CRÍTICO: Contacto inmediato con gerente de cuenta');
      recommendations.push('🔍 Revisar red flags detallados para acciones específicas');
    } else if (probability > 0.4) {
      recommendations.push('📌 Monitoreo regular recomendado');
    }

    // Basarse en red flags
    if (response.red_flags && response.red_flags.length > 0) {
      const criticalFlags = response.red_flags.filter(f => f.severity === 'critical');
      if (criticalFlags.length > 0) {
        recommendations.push(`🚩 ${criticalFlags.length} flag(s) crítico(s) detectado(s)`);
      }
    }

    return recommendations.length > 0 ? recommendations : ['✅ Continuar monitoreo regular'];
  }

  /**
   * Validación exhaustiva de datos de entrada
   */
  private _validateInputData(data: QuarterlyMetrics): boolean {
    if (!data) return false;
    if (!data.financials || !data.credit_behavior || !data.app_engagement || !data.services_flags) {
      return false;
    }

    // Validar rangos
    if (data.app_engagement.Trimestre_Dias_Actividad < 0 || data.app_engagement.Trimestre_Dias_Actividad > 90) {
      return false;
    }

    if (data.financials.Ingresos < 0 || data.financials.Gastos < 0 || data.financials.Deuda < 0 || data.financials.Activos < 0) {
      return false;
    }

    return true;
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private _handleHttpError(error: HttpErrorResponse | any): Observable<never> {
    let errorMessage = 'Error en la predicción';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = '❌ No se puede conectar con el AI Service. Verifica que esté corriendo en http://152.67.34.202:8000';
      } else if (error.status === 400) {
        errorMessage = `❌ Datos inválidos: ${error.error?.detail || 'Por favor revisa los valores ingresados'}`;
      } else if (error.status === 500) {
        errorMessage = '❌ Error del servidor. Intenta de nuevo en unos momentos';
      } else if (error.status === 408) {
        errorMessage = '⏱️ La solicitud tardó demasiado. Intenta de nuevo';
      } else {
        errorMessage = `❌ Error ${error.status}: ${error.error?.message || error.message}`;
      }
    } else if (error instanceof Error && error.name === 'TimeoutError') {
      errorMessage = '⏱️ Timeout: El servidor tardó demasiado en responder';
    }

    console.error(`[PredictionService Error]`, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Manejo de errores de validación
   */
  private _handleError(message: string): Observable<never> {
    console.error(`[PredictionService Error] ${message}`);
    return throwError(() => new Error(message));
  }
}
