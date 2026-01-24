import { Component, Input, Output, EventEmitter, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  PredictionResponse, 
  StaticProfile, 
  QuarterlyMetrics,
  RedFlag
} from '../../core/models/churn.interface';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';
import { ResultsPanelComponent } from './results-panel.component';
import { ExportService } from '../../core/services/export.service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

/**
 * ResultsModalComponent
 * Modal reutilizable para mostrar resultados en:
 * - Predicción de churn
 * - Vista de empresas
 * - Historial de predicciones
 */
@Component({
  selector: 'app-results-modal',
  standalone: true,
  imports: [CommonModule, ResultsPanelComponent, BaseChartDirective],
  templateUrl: './results-modal.component.html',
  styleUrls: ['./results-modal.component.scss']
})
export class ResultsModalComponent {
  @Input() predictionResult: PredictionResponse | null = null;
  @Input() profile: Partial<StaticProfile> | null = null;
  @Input() metrics: QuarterlyMetrics | null = null;
  @Input() isOpen = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() newPrediction = new EventEmitter<void>();

  @ViewChild('riskChart') riskChart!: BaseChartDirective;
  @ViewChild('creditChart') creditChart!: BaseChartDirective;
  @ViewChild('financialChart') financialChart!: BaseChartDirective;

  private exportService = inject(ExportService);
  isExporting = false;
  activeTab: 'results' | 'charts' = 'results';

  /**
   * Helper para verificar si es churn (predicción = '1' o 1)
   */
  isChurn(): boolean {
    return String(this.predictionResult?.churn_prediction) === '1';
  }

  /**
   * Helper para calcular nivel de riesgo (Bajo/Medio/Alto)
   */
  getRiskLevel(): string {
    const prob = this.predictionResult?.churn_probability || 0;
    const percentage = prob > 1 ? prob : prob * 100;
    if (percentage < 33) return 'Bajo';
    if (percentage < 66) return 'Medio';
    return 'Alto';
  }

  /**
   * Helper para obtener color del nivel de riesgo
   */
  getRiskColor(): string {
    const level = this.getRiskLevel();
    if (level === 'Bajo') return 'text-green-600';
    if (level === 'Medio') return 'text-amber-600';
    return 'text-red-600';
  }

  /**
   * Helper para obtener color de fondo del nivel de riesgo
   */
  getRiskBgColor(): string {
    const level = this.getRiskLevel();
    if (level === 'Bajo') return 'bg-green-50 border-green-200';
    if (level === 'Medio') return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  }

  /**
   * Helper para obtener red flags de forma segura
   */
  getRedFlags(): (RedFlag | string)[] {
    return this.predictionResult?.red_flags || [];
  }

  /**
   * Helper para obtener lista única de flags (sin repetidos)
   */
  getUniqueFlagsList(): (RedFlag | string)[] {
    const flags = this.getRedFlags();
    const seen = new Set<string>();
    return flags.filter(flag => {
      const key = typeof flag === 'string' ? flag : (flag.flag || flag.description || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Emite nuevo cálculo
   */
  onNewPrediction(): void {
    this.newPrediction.emit();
    this.close();
  }

  /**
   * Exporta el resultado a PDF
   */
  exportToPDF(): void {
    if (!this.predictionResult || !this.profile) return;
    
    this.isExporting = true;
    this.exportService.exportToPDF(
      this.profile,
      this.metrics || {} as QuarterlyMetrics,
      this.predictionResult
    ).then(() => {
      this.isExporting = false;
    }).catch((err: any) => {
      console.error('Error al exportar PDF:', err);
      this.isExporting = false;
    });
  }

  /**
   * Exporta a CSV
   */
  exportToCSV(): void {
    if (!this.predictionResult || !this.profile) return;
    
    this.exportService.exportToCSV(
      this.profile,
      this.metrics || {} as QuarterlyMetrics,
      this.predictionResult
    );
  }

  /**
   * Exporta a JSON
   */
  exportToJSON(): void {
    if (!this.predictionResult || !this.profile) return;
    
    this.exportService.exportToJSON(
      this.profile,
      this.metrics || {} as QuarterlyMetrics,
      this.predictionResult
    );
  }

  /**
   * Gráfica de distribución de riesgo
   */
  riskDistributionChart: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Bajo', 'Medio', 'Alto'],
      datasets: [{
        data: [40, 35, 25],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderColor: ['#16a34a', '#d97706', '#dc2626'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom' as const,
          labels: { font: { size: 10 }, padding: 8 }
        }
      }
    }
  };

  /**
   * Gráfica de crédito behavior
   */
  creditBehaviorChart: ChartConfiguration<'radar'> = {
    type: 'radar',
    data: {
      labels: ['Aprob.', 'Pago', 'Vigentes', 'Historial'],
      datasets: [{
        label: 'Score',
        data: [65, 75, 45, 80],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          labels: { font: { size: 9 } }
        }
      },
      scales: {
        r: { 
          beginAtZero: true,
          max: 100,
          ticks: { font: { size: 8 } }
        }
      }
    }
  };

  /**
   * Gráfica de métricas financieras
   */
  financialMetricsChart: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: ['Ing', 'Gast', 'Marg', 'Deuda', 'Act'],
      datasets: [{
        label: 'M',
        data: [1.5, 1.0, 0.5, 0.2, 1.8],
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          labels: { font: { size: 9 } }
        }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { font: { size: 8 } }
        },
        x: {
          ticks: { font: { size: 8 } }
        }
      }
    }
  };}