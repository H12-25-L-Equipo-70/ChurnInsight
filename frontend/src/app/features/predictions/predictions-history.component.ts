import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionsDataService, SavedPrediction } from '../../core/services/predictions-data.service';

/**
 * PredictionsHistoryComponent
 * Muestra historial de predicciones guardadas (desde BD o localStorage)
 */
@Component({
  selector: 'app-predictions-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">📋 Historial de Predicciones</h2>
          <p class="text-slate-600">Últimas predicciones realizadas</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="loadHistory()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
            🔄 Recargar
          </button>
          <button
            (click)="exportHistory()"
            [disabled]="predictions().length === 0"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-50">
            📥 Exportar
          </button>
          <button
            (click)="clearHistory()"
            [disabled]="predictions().length === 0"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50">
            🗑️ Limpiar
          </button>
        </div>
      </div>

      <!-- Estado -->
      <div *ngIf="isLoading()" class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p class="text-blue-900 font-medium">⏳ Cargando predicciones...</p>
      </div>

      <!-- Tabla de Historial -->
      <div *ngIf="!isLoading() && predictions().length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">CUIT</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Empresa</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Sector</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-900">Probabilidad</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-900">Predicción</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-900">Red Flags</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Fecha</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pred of predictions()" 
                  class="border-b border-slate-200 hover:bg-slate-50 transition">
                <td class="px-4 py-3 font-mono text-slate-700 text-xs">{{ pred.cuit }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ pred.nombre_empresa }}</td>
                <td class="px-4 py-3 text-slate-700">{{ pred.sector }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="font-bold"
                        [class.text-red-600]="(pred.churn_probability * 100) > 70"
                        [class.text-amber-600]="(pred.churn_probability * 100) > 40 && (pred.churn_probability * 100) <= 70"
                        [class.text-emerald-600]="(pred.churn_probability * 100) <= 40">
                    {{ (pred.churn_probability * 100).toFixed(1) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                        [class.bg-red-600]="pred.churn_prediction === 1 || pred.churn_prediction === 'YES'"
                        [class.bg-emerald-600]="pred.churn_prediction === 0 || pred.churn_prediction === 'NO'">
                    {{ pred.churn_prediction === 1 || pred.churn_prediction === 'YES' ? '⚠️' : '✅' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                    {{ pred.red_flags?.length || 0 }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-600 text-xs">
                  {{ formatDate(pred.saved_at || pred.timestamp) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    (click)="deleteHistory(pred.id!)"
                    *ngIf="pred.id"
                    class="text-red-600 hover:text-red-800 transition text-lg"
                    title="Eliminar">
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación/Resumen -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <p>Total: <strong>{{ predictions().length }}</strong> predicciones guardadas</p>
        </div>
      </div>

      <!-- Sin historial -->
      <div *ngIf="!isLoading() && predictions().length === 0" 
           class="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <p class="text-slate-600 font-medium">📭 No hay predicciones guardadas</p>
        <p class="text-slate-500 text-sm mt-1">Las predicciones se guardarán automáticamente</p>
      </div>

      <!-- Estado de guardado -->
      <div *ngIf="storageStatus()" 
           [class.bg-blue-50]="!storageStatus().includes('localStorage')"
           [class.bg-amber-50]="storageStatus().includes('localStorage')"
           class="p-4 rounded-lg border text-sm"
           [class.border-blue-200]="!storageStatus().includes('localStorage')"
           [class.border-amber-200]="storageStatus().includes('localStorage')">
        <p [class.text-blue-900]="!storageStatus().includes('localStorage')"
           [class.text-amber-900]="storageStatus().includes('localStorage')">
          {{ storageStatus() }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PredictionsHistoryComponent implements OnInit {
  private predictionsService = inject(PredictionsDataService);

  predictions = signal<SavedPrediction[]>([]);
  isLoading = signal(false);
  storageStatus = signal<string>('');

  ngOnInit(): void {
    this.loadHistory();
  }

  /**
   * Carga el historial de predicciones
   */
  loadHistory(): void {
    this.isLoading.set(true);
    this.storageStatus.set('');

    this.predictionsService.getRecentPredictions(50).subscribe({
      next: (preds) => {
        this.predictions.set(preds);
        this.isLoading.set(false);
        
        if (preds.length === 0) {
          this.storageStatus.set('ℹ️ No hay predicciones guardadas aún');
        } else {
          this.storageStatus.set('✅ Predicciones cargadas (BD o localStorage)');
        }
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.isLoading.set(false);
        this.storageStatus.set('⚠️ Error al cargar historial (localStorage disponible como fallback)');
      }
    });
  }

  /**
   * Exporta historial a JSON
   */
  exportHistory(): void {
    const json = this.predictionsService.exportToJSON();
    if (!json) {
      alert('No hay predicciones para exportar');
      return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn_predictions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Elimina una predicción del historial
   */
  deleteHistory(id: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta predicción?')) return;

    this.predictionsService.deletePrediction(id).subscribe({
      next: () => {
        this.predictions.set(this.predictions().filter(p => p.id !== id));
      },
      error: (error) => {
        console.error('Error eliminando predicción:', error);
        alert('Error al eliminar la predicción');
      }
    });
  }

  /**
   * Limpia todo el historial
   */
  clearHistory(): void {
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará TODAS las predicciones guardadas.')) return;

    this.predictionsService.clearLocalCache();
    this.predictions.set([]);
    this.storageStatus.set('✅ Historial limpiado');
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
