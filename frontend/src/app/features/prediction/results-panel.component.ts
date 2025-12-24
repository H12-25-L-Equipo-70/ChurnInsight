import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  PredictionResponse, 
  StaticProfile, 
  QuarterlyMetrics 
} from '../../core/models/churn.interface';
import { ExportService } from '../../core/services/export.service';

/**
 * ResultsPanelComponent
 * Panel de resultados mejorado para mostrar predicciones
 * Incluye exportación y recomendaciones detalladas
 */
@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-panel.component.html'
})
export class ResultsPanelComponent {
  @Input() predictionResult: PredictionResponse | null = null;
  @Input() profile: Partial<StaticProfile> | null = null;
  @Input() metrics: QuarterlyMetrics | null = null;
  
  @Output() newPrediction = new EventEmitter<void>();
  @Output() downloadReport = new EventEmitter<string>();

  private exportService = inject(ExportService);
  exportStatus = { message: '', isError: false };

  /**
   * Descarga reporte en CSV
   */
  downloadCSV(): void {
    if (!this.profile || !this.metrics || !this.predictionResult) return;
    
    this.exportService.exportToCSV(
      this.profile,
      this.metrics,
      this.predictionResult,
      `churn_${this.profile.CUIT}_${new Date().toISOString().split('T')[0]}.csv`
    );
    
    this.showExportStatus('Reporte CSV descargado correctamente', false);
  }

  /**
   * Descarga reporte en JSON
   */
  downloadJSON(): void {
    if (!this.profile || !this.metrics || !this.predictionResult) return;
    
    this.exportService.exportToJSON(
      this.profile,
      this.metrics,
      this.predictionResult,
      `churn_${this.profile.CUIT}_${new Date().toISOString().split('T')[0]}.json`
    );
    
    this.showExportStatus('Reporte JSON descargado correctamente', false);
  }

  /**
   * Copia resultado al portapapeles
   */
  async copyToClipboard(): Promise<void> {
    if (!this.profile || !this.predictionResult) return;
    
    const success = await this.exportService.copyToClipboard(
      this.profile,
      this.predictionResult
    );
    
    this.showExportStatus(
      success ? 'Copiado al portapapeles' : 'Error al copiar',
      !success
    );
  }

  /**
   * Muestra estado de exportación
   */
  private showExportStatus(message: string, isError: boolean): void {
    this.exportStatus = { message, isError };
    setTimeout(() => {
      this.exportStatus = { message: '', isError: false };
    }, 3000);
  }

  /**
   * Emite evento para nueva predicción
   */
  startNewPrediction(): void {
    this.newPrediction.emit();
  }

  /**
   * Obtiene texto de recomendación
   */
  getRecommendationIcon(index: number): string {
    const icons = ['⚠️', '📋', '🎯', '📞', '📊'];
    return icons[index % icons.length];
  }

  /**
   * Calcula color según riesgo
   */
  getRiskColor(prevision: string): string {
    switch (prevision) {
      case 'alto':
        return 'text-red-600';
      case 'medio':
        return 'text-amber-600';
      case 'bajo':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  }

  getRiskBgColor(prevision: string): string {
    switch (prevision) {
      case 'alto':
        return 'bg-red-50 border-red-200';
      case 'medio':
        return 'bg-amber-50 border-amber-200';
      case 'bajo':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }
}
