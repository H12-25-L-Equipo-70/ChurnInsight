import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { StaticProfile } from '../models/churn.interface';

/**
 * Interfaz para respuesta del Backend - Empresa
 */
export interface CompanyDTO {
  CUIT: string;
  Nombre_Empresa: string;
  Sector: string;
  Provincia: string;
  [key: string]: any; // Otros campos opcionales del backend
}

/**
 * CompanyService
 * Integración con el Backend para búsqueda y gestión de empresas
 * 
 * Responsabilidades:
 * - Buscar empresas por CUIT en /api/v1/companies/{cuit}
 * - Listar sectores disponibles en /api/v1/companies/segments/sectors
 * - Listar provincias disponibles en /api/v1/companies/segments/provincias
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly BACKEND_URL = 'http://152.67.34.202:8080/api/v1/companies';
  private readonly REQUEST_TIMEOUT_MS = 10000; // 10 segundos

  /**
   * Busca una empresa por CUIT
   * 
   * @param cuit - CUIT de la empresa (11 dígitos)
   * @returns Observable<CompanyDTO> con datos de la empresa
   */
  getCompanyByCuit(cuit: string): Observable<CompanyDTO> {
    if (!cuit || cuit.length !== 11) {
      return throwError(() => new Error('CUIT inválido. Debe tener 11 dígitos'));
    }

    // Limpiar CUIT (solo dígitos)
    const cleanCuit = cuit.replace(/\D/g, '');

    return this.http.get<CompanyDTO>(
      `${this.BACKEND_URL}/${cleanCuit}`
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => this._normalizeCompanyResponse(response)),
      catchError(error => this._handleHttpError(error))
    );
  }

  /**
   * Obtiene listado de sectores disponibles
   * 
   * @returns Observable<string[]> array de nombres de sectores
   */
  getSectors(): Observable<string[]> {
    return this.http.get<any>(
      `${this.BACKEND_URL}/segments/sectors`
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => this._extractArrayFromResponse(response, 'sectors')),
      catchError(error => {
        console.error('Error al obtener sectores:', error);
        // Retornar lista de default si hay error
        return of(['Fintech', 'Tecnología', 'Retail', 'Servicios', 'Otros']);
      })
    );
  }

  /**
   * Obtiene listado de provincias disponibles
   * 
   * @returns Observable<string[]> array de nombres de provincias
   */
  getProvincias(): Observable<string[]> {
    return this.http.get<any>(
      `${this.BACKEND_URL}/segments/provincias`
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      map(response => this._extractArrayFromResponse(response, 'provincias')),
      catchError(error => {
        console.error('Error al obtener provincias:', error);
        // Retornar lista de default si hay error
        return of([
          'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'San Juan',
          'Catamarca', 'La Rioja', 'Entre Ríos', 'Santiago del Estero',
          'Misiones', 'Corrientes', 'Formosa', 'Chaco', 'Tucumán',
          'Salta', 'Jujuy', 'La Pampa', 'Neuquén', 'Río Negro',
          'Chubut', 'Santa Cruz', 'Tierra del Fuego'
        ]);
      })
    );
  }

  /**
   * Obtiene salud del backend
   * 
   * @returns Observable<any> respuesta del health check
   */
  healthCheck(): Observable<any> {
    return this.http.get<any>(
      `${this.BACKEND_URL}/health`
    ).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      catchError(error => {
        console.error('Backend health check failed:', error);
        return throwError(() => new Error('Backend no disponible'));
      })
    );
  }

  /**
   * Normaliza respuesta de empresa del backend
   */
  private _normalizeCompanyResponse(response: any): CompanyDTO {
    // Mapear campos del backend a CompanyDTO
    return {
      CUIT: response.CUIT || response.cuit || '',
      Nombre_Empresa: response.Nombre_Empresa || response.nombre_empresa || response.name || '',
      Sector: response.Sector || response.sector || '',
      Provincia: response.Provincia || response.provincia || response.province || ''
    };
  }

  /**
   * Extrae array de respuesta del backend (flexibilidad en estructura)
   */
  private _extractArrayFromResponse(response: any, key: string): string[] {
    // Intentar múltiples estructuras de respuesta
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response[key])) {
      return response[key];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (typeof response === 'object') {
      // Buscar el primer array en el objeto
      for (const value of Object.values(response)) {
        if (Array.isArray(value)) {
          return value;
        }
      }
    }
    return [];
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private _handleHttpError(error: HttpErrorResponse | any): Observable<never> {
    let errorMessage = 'Error al buscar empresa';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = '❌ No se puede conectar con el Backend. Verifica que esté corriendo en http://152.67.34.202:8080';
      } else if (error.status === 404) {
        errorMessage = '❌ Empresa no encontrada. Verifica el CUIT ingresado';
      } else if (error.status === 400) {
        errorMessage = `❌ Datos inválidos: ${error.error?.detail || 'Por favor revisa el CUIT'}`;
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

    console.error(`[CompanyService Error]`, error);
    return throwError(() => new Error(errorMessage));
  }
}
