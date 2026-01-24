import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionsDataService, SavedPrediction } from '../../core/services/predictions-data.service';
import { ResultsModalComponent } from '../prediction/results-modal.component';
import { QuarterlyMetrics, StaticProfile, PredictionResponse } from '../../core/models/churn.interface';

/**
 * PredictionsHistoryComponent
 * Muestra historial de predicciones guardadas (desde BD o localStorage)
 */
@Component({
  selector: 'app-predictions-history',
  standalone: true,
  imports: [CommonModule, ResultsModalComponent],
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
                    {{ pred.red_flags.length || 0 }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-600 text-xs">
                  {{ formatDate(pred.saved_at || pred.timestamp) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button (click)="showDetails(pred)" class="text-blue-600 hover:underline">
                    Ver Detalles
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
    
    <app-results-modal
      [isOpen]="isModalOpen()"
      [predictionResult]="selectedPrediction()"
      [profile]="selectedProfile()"
      [metrics]="selectedMetrics()"
      (closeModal)="closeModal()">
    </app-results-modal>
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

  selectedPrediction = signal<PredictionResponse | null>(null);
  selectedProfile = signal<StaticProfile | null>(null);
  selectedMetrics = signal<QuarterlyMetrics | null>(null);
  isModalOpen = signal(false);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.storageStatus.set('');

    this.predictionsService.getRecentPredictions(50).subscribe({
      next: (preds) => {
        this.predictions.set(preds);
        this.isLoading.set(false);
        this.storageStatus.set(preds.length > 0 ? '✅ Predicciones cargadas' : 'ℹ️ No hay predicciones guardadas');
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.isLoading.set(false);
        this.storageStatus.set('⚠️ Error al cargar historial');
      }
    });
  }

  showDetails(prediction: SavedPrediction): void {
    const predictionResponse: PredictionResponse = {
      CUIT: prediction.cuit,
      NOMBRE_EMPRESA: prediction.nombre_empresa,
      churn_probability: prediction.churn_probability,
      churn_prediction: typeof prediction.churn_prediction === 'number' ? (prediction.churn_prediction === 1 ? 'YES' : 'NO') : (prediction.churn_prediction as 'YES' | 'NO'),
      threshold_used: prediction.threshold_used || 0,
      red_flags: prediction.red_flags,
      timestamp: prediction.timestamp,
      confidence: prediction.confidence
    };

    this.selectedPrediction.set(predictionResponse);

    this.selectedProfile.set({
      CUIT: prediction.cuit,
      Nombre_Empresa: prediction.nombre_empresa,
      Sector: prediction.sector,
      Provincia: prediction.provincia
    });
    this.selectedMetrics.set(this.createFallbackMetrics());
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  exportHistory(): void {
    const json = this.predictionsService.exportToJSON();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn_predictions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  clearHistory(): void {
    if (confirm('⚠️ ¿Estás seguro? Esto eliminará TODAS las predicciones guardadas.')) {
      this.predictionsService.clearLocalCache();
      this.predictions.set([]);
      this.storageStatus.set('✅ Historial limpiado');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
  
  private createFallbackMetrics(): QuarterlyMetrics {
    return {
      Periodo_Fiscal: '',
      financials: { Ingresos: 0, Gastos: 0, Margen: 0, Deuda: 0, Activos: 0 },
      credit_behavior: { Prestamos_Solicitados: 0, Prestamos_Aprobados: 0, Prestamos_Cancelados: 0, Prestamos_Vigentes: 0, Ticket_Promedio_Solicitado: 0, Ticket_Promedio_Aprobado: 0, Monto_Solicitado: 0, Monto_Aprobado: 0, Tiempo_Cancelacion_Prestamo: 0 },
      app_engagement: { Trimestre_Dias_Actividad: 0, Trimestre_Dias_Inactividad: 0, Promedio_Login_Dia: 0, Total_Login_Dia: 0 },
      services_flags: { Transferencias: false, Pagos: false, Creditos: false, Inversiones: false, Servicios_Utilizados: 0 }
    };
  }
}

