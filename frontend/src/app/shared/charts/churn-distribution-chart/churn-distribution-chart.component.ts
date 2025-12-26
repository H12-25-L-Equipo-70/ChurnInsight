import { Component, Input, OnChanges, SimpleChanges, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FlatCompanyRecord } from '../../../core/models/churn.interface';

@Component({
  selector: 'app-churn-distribution-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './churn-distribution-chart.component.html'
})
export class ChurnDistributionChartComponent implements OnChanges {
  @Input() data: FlatCompanyRecord[] = [];
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    const lowRisk = this.data.filter(c => !c.Churn).length;
    const highRisk = this.data.filter(c => c.Churn).length;
    // For now, we'll just split the non-churn into low and medium
    const mediumRisk = Math.floor(lowRisk * 0.4);
    const finalLowRisk = lowRisk - mediumRisk;


    this.doughnutChartData.datasets[0].data = [finalLowRisk, mediumRisk, highRisk];
  }
}
