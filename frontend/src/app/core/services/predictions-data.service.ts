import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PredictionResponse, StaticProfile, QuarterlyMetrics, FlatCompanyRecord } from '../models/churn.interface';

export interface SavedPrediction {
  id?: string;
  cuit: string;
  nombre_empresa: string;
  sector: string;
  provincia: string;
  churn_probability: number;
  churn_prediction: number | string;
  red_flags: any[];
  timestamp: string;
  saved_at?: string;
  threshold_used?: number;
  confidence?: number;
}

/**
 * PredictionsDataService
 * Gestiona guardado y recuperación de predicciones en BD
 * Fail-safe: si la BD no está disponible, funciona sin errores críticos
 */
@Injectable({
  providedIn: 'root'
})
export class PredictionsDataService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly BACKEND_URL = 'http://152.67.34.202:8080/api/v1';
  private readonly PREDICTIONS_ENDPOINT = `${this.BACKEND_URL}/predictions`;
  
  // Cache local como fallback
  private localCache: SavedPrediction[] = [];

  /**
   * Verifica si estamos ejecutando en el navegador (no en SSR)
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Guarda una predicción en BD (con fallback a localStorage)
   * NO lanza errores si BD no está disponible
   */
  savePrediction(
    profile: Partial<StaticProfile>,
    result: PredictionResponse,
    metrics: QuarterlyMetrics
  ): Observable<SavedPrediction> {
    const savedPrediction: SavedPrediction = {
      cuit: profile.CUIT?.toString() || '',
      nombre_empresa: profile.Nombre_Empresa || '',
      sector: profile.Sector || '',
      provincia: profile.Provincia || '',
      churn_probability: result.churn_probability || result.probabilidad || 0,
      churn_prediction: result.churn_prediction || (result.prevision === 'alto' ? 1 : 0),
      red_flags: result.red_flags || [],
      timestamp: result.timestamp || new Date().toISOString(),
      threshold_used: result.threshold_used,
      confidence: result.confidence
    };

    // Como no tenemos endpoint de backend para guardar predicciones,
    // guardar directamente en localStorage
    return this._saveToLocalStorage(savedPrediction);
  }

  /**
   * Obtiene todas las predicciones guardadas
   * Primero intenta desde BD, luego desde localStorage
   * CORRECCIÓN: Combina ambas fuentes para asegurar que se vea el historial reciente
   */
  getPredictions(): Observable<SavedPrediction[]> {
    const localData = this._loadFromLocalStorage();
    console.log('✅ Predicciones cargadas desde LocalStorage (Modo Local)');
    return of(localData);
  }

  /**
   * Obtiene predicciones por CUIT
   */
  getPredictionsByCuit(cuit: string): Observable<SavedPrediction[]> {
    const local = this._loadFromLocalStorage().filter(p => p.cuit === cuit);
    return of(local);
  }

  /**
   * Obtiene historial de predicciones (últimas N)
   */
  getRecentPredictions(limit: number = 10): Observable<SavedPrediction[]> {
    return this.getPredictions().pipe(
      map(predictions => 
        predictions
          .sort((a, b) => new Date(b.saved_at || b.timestamp).getTime() - new Date(a.saved_at || a.timestamp).getTime())
          .slice(0, limit)
      )
    );
  }

  /**
   * Elimina una predicción (solo si BD disponible)
   */
  deletePrediction(id: string): Observable<boolean> {
    this._deleteFromLocalStorage(id);
    return of(true);
  }

  // ============================================================================
  // LOCALSTORAGE FALLBACK - Para cuando BD no está disponible
  // ============================================================================

  /**
   * Guarda predicción en localStorage
   */
  private _saveToLocalStorage(prediction: SavedPrediction): Observable<SavedPrediction> {
    // Solo funciona en el navegador, no en SSR
    if (!this.isBrowser()) {
      console.warn('⚠️ localStorage no disponible en servidor, guardando en caché local');
      const withId = { ...prediction, id: Date.now().toString(), saved_at: new Date().toISOString() };
      this.localCache.push(withId);
      return of(withId);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('churninsight_predictions') || '[]');
      const withId = { ...prediction, id: Date.now().toString(), saved_at: new Date().toISOString() };
      stored.push(withId);
      localStorage.setItem('churninsight_predictions', JSON.stringify(stored));
      
      console.log('💾 Predicción guardada en localStorage', withId);
      return of(withId);
    } catch (error) {
      console.error('❌ Error guardando en localStorage', error);
      // Si falla localStorage, guardar en cache local
      const withId = { ...prediction, id: Date.now().toString(), saved_at: new Date().toISOString() };
      this.localCache.push(withId);
      return of(withId);
    }
  }

  /**
   * Carga predicciones desde localStorage
   */
  private _loadFromLocalStorage(): SavedPrediction[] {
    // Si no estamos en el navegador, usar caché local
    if (!this.isBrowser()) {
      console.warn('⚠️ localStorage no disponible en servidor, usando caché local');
      return this.localCache;
    }

    try {
      const stored = localStorage.getItem('churninsight_predictions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error cargando de localStorage', error);
      return [];
    }
  }

  /**
   * Elimina predicción de localStorage
   */
  private _deleteFromLocalStorage(id: string): void {
    if (!this.isBrowser()) {
      this.localCache = this.localCache.filter(p => p.id !== id);
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem('churninsight_predictions') || '[]');
      const filtered = stored.filter((p: SavedPrediction) => p.id !== id);
      localStorage.setItem('churninsight_predictions', JSON.stringify(filtered));
    } catch (error) {
      console.error('❌ Error eliminando de localStorage', error);
    }
  }

  /**
   * Limpia todo el caché local
   */
  clearLocalCache(): void {
    if (!this.isBrowser()) {
      this.localCache = [];
      console.log('✅ Caché local limpiado (servidor)');
      return;
    }

    try {
      localStorage.removeItem('churninsight_predictions');
      this.localCache = [];
      console.log('✅ Caché local limpiado');
    } catch (error) {
      console.error('❌ Error limpiando caché', error);
    }
  }

  /**
   * Exporta predicciones locales a JSON (para descargar)
   */
  exportToJSON(): string {
    try {
      const data = this._loadFromLocalStorage();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Error exportando a JSON', error);
      return '';
    }
  }

  /**
   * Genera 20 empresas aleatorias basadas en el dataset
   * Para uso en el módulo de Empresas (Tabla)
   */
  getRandomCompanies(): Observable<FlatCompanyRecord[]> {
    const sectors = ['Tecnología', 'Servicios', 'Comercio', 'Industria', 'Agro'];
    const provinces = ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza'];
    const companies: FlatCompanyRecord[] = [];
    const startCuit = 30000000000; // CUITs corporativos suelen empezar con 30 o 33

    for (let i = 0; i < 20; i++) {
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const ingresos = Math.floor(Math.random() * 45000000) + 5000000; // Entre 5M y 50M
      const ratioGastos = 0.4 + Math.random() * 0.5; // Gastos entre 40% y 90%
      const gastos = Math.floor(ingresos * ratioGastos);
      const margen = ingresos - gastos;
      const diasActivos = Math.floor(Math.random() * 85) + 5; // Entre 5 y 90 días
      
      // Lógica simple de churn para el mock
      const isChurn = (margen < 0 && diasActivos < 15) || (diasActivos < 5);

      companies.push({
        CUIT: (startCuit + Math.floor(Math.random() * 89999999) + 10000000).toString(),
        Nombre_Empresa: `Empresa ${sector} ${i + 1} S.A.`,
        Sector: sector,
        Provincia: provinces[Math.floor(Math.random() * provinces.length)],
        Periodo_Fiscal: '2024-Q4',
        
        Ingresos: ingresos,
        Gastos: gastos,
        Margen: margen,
        Deuda: Math.floor(ingresos * (Math.random() * 0.6)), // Deuda hasta 60% de ingresos
        Activos: Math.floor(ingresos * (1.2 + Math.random())), // Activos > Ingresos
        
        Prestamos_Solicitados: Math.floor(Math.random() * 6),
        Prestamos_Aprobados: Math.floor(Math.random() * 4),
        Prestamos_Cancelados: Math.floor(Math.random() * 2),
        Prestamos_Vigentes: Math.floor(Math.random() * 3),
        Ticket_Promedio_Solicitado: Math.floor(Math.random() * 500000) + 100000,
        Ticket_Promedio_Aprobado: Math.floor(Math.random() * 400000) + 100000,
        Monto_Solicitado: Math.floor(Math.random() * 2000000) + 500000,
        Monto_Aprobado: Math.floor(Math.random() * 1500000) + 500000,
        Tiempo_Cancelacion_Prestamo: Math.floor(Math.random() * 60) + 15,
        
        Trimestre_Dias_Actividad: diasActivos,
        Trimestre_Dias_Inactividad: 90 - diasActivos,
        Promedio_Login_Dia: Number((Math.random() * 5 + 0.5).toFixed(1)),
        Total_Login_Dia: Math.floor(diasActivos * (Math.random() * 5 + 1)),
        
        Transferencias: Math.random() > 0.5,
        Pagos: Math.random() > 0.5,
        Creditos: Math.random() > 0.5,
        Inversiones: Math.random() > 0.5,
        Servicios_Utilizados: Math.floor(Math.random() * 4),
        
        Churn: isChurn,
        Churn_Date: null
      });
    }
    
    return of(companies);
  }

  /**
   * Carga el dataset de empresas desde JSON (reemplazo para el CSV)
   * Usar este método en companies-table.component.ts
   */
  getCompaniesFromJson(): Observable<FlatCompanyRecord[]> {
    return this.http.get<FlatCompanyRecord[]>('assets/data/dataset_empresas_fintech_v2.7.json')
      .pipe(
        catchError(error => {
          console.warn('⚠️ No se encontró el JSON, usando generador aleatorio', error);
          return this.getRandomCompanies();
        })
      );
  }
}
