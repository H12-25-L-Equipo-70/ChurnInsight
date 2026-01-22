import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PredictionResponse, StaticProfile, QuarterlyMetrics } from '../models/churn.interface';

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
  private readonly BACKEND_URL = 'http://localhost:8080/api/v1';
  private readonly PREDICTIONS_ENDPOINT = `${this.BACKEND_URL}/predictions`;
  
  // Cache local como fallback
  private localCache: SavedPrediction[] = [];

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

    // Intentar guardar en BD
    return this.http.post<SavedPrediction>(
      `${this.PREDICTIONS_ENDPOINT}/save`,
      savedPrediction
    ).pipe(
      map(response => {
        console.log('✅ Predicción guardada en BD');
        this.localCache.push(response);
        return response;
      }),
      catchError(error => {
        // BD no disponible: guardar en localStorage
        console.warn('⚠️ BD no disponible, guardando en localStorage', error);
        return this._saveToLocalStorage(savedPrediction);
      })
    );
  }

  /**
   * Obtiene todas las predicciones guardadas
   * Primero intenta desde BD, luego desde localStorage
   */
  getPredictions(): Observable<SavedPrediction[]> {
    // Intentar obtener desde BD
    return this.http.get<SavedPrediction[]>(
      `${this.PREDICTIONS_ENDPOINT}/list`
    ).pipe(
      map(predictions => {
        console.log('✅ Predicciones cargadas desde BD');
        this.localCache = predictions;
        return predictions;
      }),
      catchError(error => {
        // BD no disponible: cargar desde localStorage
        console.warn('⚠️ BD no disponible, cargando desde localStorage', error);
        const local = this._loadFromLocalStorage();
        return of(local);
      })
    );
  }

  /**
   * Obtiene predicciones por CUIT
   */
  getPredictionsByCuit(cuit: string): Observable<SavedPrediction[]> {
    return this.http.get<SavedPrediction[]>(
      `${this.PREDICTIONS_ENDPOINT}/by-cuit/${cuit}`
    ).pipe(
      catchError(error => {
        // Si BD falla, buscar en localStorage
        console.warn('⚠️ Error obteniendo predicciones de BD, buscando en localStorage', error);
        const local = this._loadFromLocalStorage().filter(p => p.cuit === cuit);
        return of(local);
      })
    );
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
    return this.http.delete<boolean>(
      `${this.PREDICTIONS_ENDPOINT}/${id}`
    ).pipe(
      map(() => {
        console.log('✅ Predicción eliminada de BD');
        this.localCache = this.localCache.filter(p => p.id !== id);
        return true;
      }),
      catchError(error => {
        console.warn('⚠️ No se pudo eliminar predicción de BD', error);
        // Intentar eliminar de localStorage
        this._deleteFromLocalStorage(id);
        return of(true); // No fallar
      })
    );
  }

  // ============================================================================
  // LOCALSTORAGE FALLBACK - Para cuando BD no está disponible
  // ============================================================================

  /**
   * Guarda predicción en localStorage
   */
  private _saveToLocalStorage(prediction: SavedPrediction): Observable<SavedPrediction> {
    try {
      const stored = JSON.parse(localStorage.getItem('churninsight_predictions') || '[]');
      const withId = { ...prediction, id: Date.now().toString(), saved_at: new Date().toISOString() };
      stored.push(withId);
      localStorage.setItem('churninsight_predictions', JSON.stringify(stored));
      
      console.log('💾 Predicción guardada en localStorage (BD no disponible)');
      return of(withId);
    } catch (error) {
      console.error('❌ Error guardando en localStorage', error);
      // Aún así, no fallar la aplicación
      return of(prediction);
    }
  }

  /**
   * Carga predicciones desde localStorage
   */
  private _loadFromLocalStorage(): SavedPrediction[] {
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
}
