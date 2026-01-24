import { Component, Input, Output, EventEmitter, inject, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './results-modal.component.html',
  styleUrls: ['./results-modal.component.scss']
})
export class ResultsModalComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['predictionResult'] || changes['metrics']) && this.isOpen) {
      this.updateCharts();
    }
  }

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
   * Helper para obtener lista única y procesada de flags
   */
  getProcessedFlags(): RedFlag[] {
    const flags = this.getRedFlags();
    const seen = new Set<string>();
    
    const processedFlags = flags.map((flag, index) => {
      const isString = typeof flag === 'string';
      const description = isString ? flag : (flag.description || String(flag.flag));
      const key = isString ? description : `${flag.flag}-${description}`;

      if (seen.has(key)) return null;
      seen.add(key);

      const severity = isString 
        ? this._estimateSeverity(description) 
        : (flag.severity || 'low');

      return {
        flag: isString ? 'Alerta' : (flag.flag || 'Alerta'),
        description,
        severity,
        value: !isString ? flag.value : undefined
      } as RedFlag;
    });

    return processedFlags.filter((flag): flag is RedFlag => flag !== null);
  }

  /**
   * Estima la severidad de un flag de texto
   */
  private _estimateSeverity(text: string): 'critical' | 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('crític') || lowerText.includes('grave')) return 'critical';
    if (lowerText.includes('importante') || lowerText.includes('caída') || lowerText.includes('disminuci')) return 'high';
    if (lowerText.includes('atención') || lowerText.includes('revisar')) return 'medium';
    return 'low';
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

    const charts: { name: string, image: string }[] = [];
    if (this.riskChart?.chart) {
      charts.push({ name: 'Risk Distribution', image: this.riskChart.chart.toBase64Image() });
    }
    if (this.creditChart?.chart) {
      charts.push({ name: 'Credit Behavior', image: this.creditChart.chart.toBase64Image() });
    }
    if (this.financialChart?.chart) {
      charts.push({ name: 'Financial Metrics', image: this.financialChart.chart.toBase64Image() });
    }

    this.exportService.exportToPDF(
      this.profile,
      this.metrics || {} as QuarterlyMetrics,
      this.predictionResult,
      charts
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

  private updateCharts(): void {
    if (!this.predictionResult || !this.metrics) return;

    // 1. Gráfica de Riesgo (Probabilidad)
    const prob = this.predictionResult.churn_probability || 0;
    this.riskDistributionChart.data.datasets[0].data = [1 - prob, prob];
    this.riskDistributionChart.data.labels = ['Activo', 'Churn'];
    this.riskDistributionChart.data.datasets[0].backgroundColor = ['#22c55e', '#ef4444'];
    
    // 2. Gráfica de Comportamiento Crediticio
    const credit = this.metrics.credit_behavior;
    const approvalRate = (credit?.Prestamos_Aprobados || 0) / (credit?.Prestamos_Solicitados || 1);
    const activityRate = (this.metrics.app_engagement?.Trimestre_Dias_Actividad || 0) / 90;

    this.creditBehaviorChart.data.datasets[0].data = [
      (approvalRate || 0) * 100,
      (activityRate || 0) * 100,
      (credit?.Prestamos_Vigentes || 0),
      (this.metrics.services_flags?.Servicios_Utilizados || 0) * 25
    ];

    // 3. Gráfica de Métricas Financieras
    const financials = this.metrics.financials;
    this.financialMetricsChart.data.datasets[0].data = [
      (financials?.Ingresos || 0) / 1e6, // en Millones
      (financials?.Gastos || 0) / 1e6,
      (financials?.Margen || 0) / 1e6,
      (financials?.Deuda || 0) / 1e6,
      (financials?.Activos || 0) / 1e6
    ];

    // Forzar actualización de las gráficas
    this.riskChart?.chart?.update();
    this.creditChart?.chart?.update();
    this.financialChart?.chart?.update();
  }

  /**
   * Gráfica de distribución de riesgo
   */
  riskDistributionChart: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Activo', 'Churn'],
      datasets: [{
        data: [1, 0],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#ffffff'],
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
      labels: ['Tasa Aprobación', 'Actividad App', 'Prést. Vigentes', 'Servicios'],
      datasets: [{
        label: 'Score Normalizado',
        data: [0, 0, 0, 0],
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
        legend: { display: false }
      },
      scales: {
        r: { 
          beginAtZero: true,
          max: 100,
          ticks: { font: { size: 8 }, backdropColor: 'rgba(255, 255, 255, 0.5)' }
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
      labels: ['Ingresos', 'Gastos', 'Margen', 'Deuda', 'Activos'],
      datasets: [{
        label: 'Monto (en Millones)',
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
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
  };
}