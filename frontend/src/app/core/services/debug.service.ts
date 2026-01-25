import { Injectable } from '@angular/core';

/**
 * DebugService
 * Herramienta para debuguear la comunicación con APIs
 * Log estruturado para requests y responses
 */
@Injectable({
  providedIn: 'root'
})
export class DebugService {
  
  /**
   * Log de request con formato legible
   */
  logRequest(title: string, endpoint: string, payload: any): void {
    console.group(`📤 ${title}`);
    console.log('Endpoint:', endpoint);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.groupEnd();
  }

  /**
   * Log de response con formato legible
   */
  logResponse(title: string, response: any): void {
    console.group(`📥 ${title}`);
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('Keys:', Object.keys(response));
    console.groupEnd();
  }

  /**
   * Log de error con contexto
   */
  logError(title: string, error: any): void {
    console.group(`❌ ${title}`);
    console.error('Error:', error);
    if (error.error) {
      console.error('Error Details:', error.error);
      if (error.error.detail) {
        console.error('Validation Errors (detail):', JSON.stringify(error.error.detail, null, 2));
      }
    }
    console.groupEnd();
  }

  /**
   * Valida si una respuesta tiene los campos esperados
   */
  validatePredictionResponse(response: any): { valid: boolean; missingFields: string[] } {
    const expectedFields = [
      'CUIT',
      'NOMBRE_EMPRESA',
      'churn_probability',
      'churn_prediction',
      'threshold_used',
      'red_flags',
      'timestamp'
    ];

    const missingFields = expectedFields.filter(field => !(field in response));
    
    console.group('🔍 Validación de Response');
    console.log('Campos esperados:', expectedFields);
    console.log('Campos encontrados:', Object.keys(response));
    console.log('Campos faltantes:', missingFields);
    console.groupEnd();

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Mapea campos reales a esperados (útil si los nombres varían)
   */
  mapResponseFields(response: any, mapping: Record<string, string>): any {
    const mapped: any = {};
    
    for (const [expectedKey, actualKey] of Object.entries(mapping)) {
      if (actualKey in response) {
        mapped[expectedKey] = response[actualKey as keyof typeof response];
      }
    }

    return mapped;
  }
}
