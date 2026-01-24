import { Component, input, output, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  PredictionResponse, 
  StaticProfile, 
  QuarterlyMetrics,
  RedFlag
} from '../../core/models/churn.interface';
import { ExportService } from '../../core/services/export.service';
import { PredictionsDataService } from '../../core/services/predictions-data.service';

/**
 * ResultsPanelComponent
 * Panel de resultados mejorado con:
 * - Predicción de churn (probabilidad + bandera)
 * - Red flags detallados con severidad
 * - Timestamp y umbral usado
 * - Exportación y recomendaciones
 */
@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-panel.component.html'
})
export class ResultsPanelComponent {
  predictionResult = input<PredictionResponse | null>(null);
  profile = input<Partial<StaticProfile> | null>(null);
  metrics = input<QuarterlyMetrics | null>(null);
  
  newPrediction = output<void>();
  downloadReport = output<string>();

  private exportService = inject(ExportService);
  private predictionsService = inject(PredictionsDataService);
  exportStatus = { message: '', isError: false };
  isExporting = false;

  constructor() {
    // Efecto: Guardar automáticamente cuando hay un resultado
    effect(() => {
      const pred = this.predictionResult();
      const prof = this.profile();
      const met = this.metrics();
      if (pred && prof && met) {
        this.autoSavePrediction();
      }
    });
  }

  /**
   * Computed: Probabilidad en porcentaje formateada
   */
  churnProbabilityPercent = computed(() => {
    const result = this.predictionResult();
    if (!result) return '0%';
    const prob = result.churn_probability || result.probabilidad || 0;
    const normalized = prob > 1 ? prob : prob * 100;
    return `${Math.round(normalized)}%`;
  });

  /**
   * Computed: Nivel de riesgo basado en probabilidad
   */
  riskLevel = computed(() => {
    const result = this.predictionResult();
    if (!result) return 'bajo';
    
    // Intentar usar prevision del response, si no, calcular
    if (result.prevision) return result.prevision;
    
    const prob = result.churn_probability || result.probabilidad || 0;
    const normalized = prob > 1 ? prob : prob;
    
    if (normalized > 0.7) return 'alto';
    if (normalized > 0.4) return 'medio';
    return 'bajo';
  });

  /**
   * Computed: Red flags procesados y categorizados
   * Maneja tanto strings simples como objetos RedFlag
   */
  processedRedFlags = computed(() => {
    const result = this.predictionResult();
    if (!result?.red_flags) return [];
    
    return result.red_flags.map((flag, index) => {
      // Si es string simple, convertir a objeto
      if (typeof flag === 'string') {
        return {
          id: index,
          description: flag,
          severity: this._estimateSeverity(flag, index),
          isString: true
        };
      }
      
      // Si es objeto RedFlag
      return {
        id: index,
        flag: flag.flag || '',
        description: flag.description || flag as any,
        severity: flag.severity || 'medium',
        value: flag.value,
        isString: false
      };
    });
  });
  /**
   * Estima severidad de un flag basado en palabras clave
   */
  private _estimateSeverity(flagText: string, index: number): 'critical' | 'high' | 'medium' | 'low' {
    const text = flagText.toLowerCase();
    
    // Critical: problemas muy serios
    if (text.includes('critico') || text.includes('crítico') || text.includes('grave')) {
      return 'critical';
    }
    
    // High: problemas importantes
    if (text.includes('caida') || text.includes('caída') || text.includes('disminución') || 
        text.includes('alto') || text.includes('significativa')) {
      return 'high';
    }
    
    // Medium: problemas moderados
    if (text.includes('bajo') || text.includes('leve') || text.includes('información')) {
      return 'medium';
    }
    
    // Low: información adicional
    return 'low';
  }

  /**
   * Cuenta flags por severidad
   */
  countFlagsBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): number {
    return this.processedRedFlags().filter(f => f.severity === severity).length;
  }

  /**
   * Guarda automáticamente la predicción (sin errores si BD no está disponible)
   */
  private autoSavePrediction(): void {
    const pred = this.predictionResult();
    const prof = this.profile();
    const met = this.metrics();
    
    if (!pred || !prof || !met) return;

    this.predictionsService.savePrediction(prof, pred, met).subscribe({
      next: (saved) => {
        console.log('💾 Predicción guardada automáticamente', saved);
      },
      error: (error) => {
        // No mostrar error al usuario, solo log
        console.warn('⚠️ No se pudo guardar la predicción', error);
      }
    });
  }

  /**
   * Descarga reporte en CSV
   */
  downloadCSV(): void {
    const prof = this.profile();
    const met = this.metrics();
    const pred = this.predictionResult();
    if (!prof || !met || !pred) return;
    
    this.exportService.exportToCSV(
      prof,
      met,
      pred,
      `churn_${prof.CUIT}_${new Date().toISOString().split('T')[0]}.csv`
    );
    
    this.showExportStatus('✅ Reporte CSV descargado correctamente', false);
  }

  /**
   * Descarga reporte en JSON
   */
  downloadJSON(): void {
    const prof = this.profile();
    const met = this.metrics();
    const pred = this.predictionResult();
    if (!prof || !met || !pred) return;
    
    this.exportService.exportToJSON(
      prof,
      met,
      pred,
      `churn_${prof.CUIT}_${new Date().toISOString().split('T')[0]}.json`
    );
    
    this.showExportStatus('✅ Reporte JSON descargado correctamente', false);
  }

  /**
   * Descarga reporte en PDF
   */
  async downloadPDF(): Promise<void> {
    const prof = this.profile();
    const met = this.metrics();
    const pred = this.predictionResult();
    if (!prof || !met || !pred) return;
    
    try {
      this.isExporting = true;
      this.showExportStatus('⏳ Generando PDF...', false);
      
      await this.exportService.exportToPDF(
        prof,
        met,
        pred,
        [],
        `churn_${prof.CUIT}_${new Date().toISOString().split('T')[0]}.pdf`
      );
      
      this.showExportStatus('✅ Reporte PDF descargado correctamente', false);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.showExportStatus('❌ Error al generar PDF', true);
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Copia resultado al portapapeles
   */
  async copyToClipboard(): Promise<void> {
    const prof = this.profile();
    const pred = this.predictionResult();
    if (!prof || !pred) return;
    
    const success = await this.exportService.copyToClipboard(prof, pred);
    
    this.showExportStatus(
      success ? '✅ Copiado al portapapeles' : '❌ Error al copiar',
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
   * Obtiene red flags agrupados por severidad
   */
  getRedFlagsBySeverity(): { critical: RedFlag[]; high: RedFlag[]; medium: RedFlag[]; low: RedFlag[] } {
    const pred = this.predictionResult();
    const flags = pred?.red_flags || [];
    
    return {
      critical: flags.filter(f => f.severity === 'critical'),
      high: flags.filter(f => f.severity === 'high'),
      medium: flags.filter(f => f.severity === 'medium'),
      low: flags.filter(f => f.severity === 'low')
    };
  }

  /**
   * Obtiene ícono para severidad
   */
  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[severity] || '⚪';
  }

  /**
   * Obtiene clase de color para severidad
   */
  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'critical': 'text-red-700',
      'high': 'text-orange-700',
      'medium': 'text-amber-700',
      'low': 'text-green-700'
    };
    return colors[severity] || 'text-gray-700';
  }

  /**
   * Obtiene clase de fondo para tarjeta de flag
   */
  getFlagBgColor(severity: string): string {
    const colors: Record<string, string> = {
      'critical': 'bg-red-50 border-red-300',
      'high': 'bg-orange-50 border-orange-300',
      'medium': 'bg-amber-50 border-amber-300',
      'low': 'bg-green-50 border-green-300'
    };
    return colors[severity] || 'bg-gray-50 border-gray-300';
  }

  /**
   * Calcula color según riesgo
   */
  getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
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

  /**
   * Calcula clase de fondo según riesgo
   */
  getRiskBgColor(riskLevel: string): string {
    switch (riskLevel) {
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

  /**
   * Formatea timestamp a fecha legible
   */
  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  }

  /**
   * Formatea umbral (threshold) como porcentaje
   */
  formatThreshold(threshold: number): string {
    return `${Math.round(threshold * 100)}%`;
  }

  /**
   * Obtiene ícono para recomendación
   */
  getRecommendationIcon(index: number): string {
    const icons = ['⚠️', '📋', '🎯', '📞', '📊'];
    return icons[index % icons.length];
  }
}
