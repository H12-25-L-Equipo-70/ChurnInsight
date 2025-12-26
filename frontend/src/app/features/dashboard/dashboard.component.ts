import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics.service';
import { FlatCompanyRecord } from '../../core/models/churn.interface';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private statisticsService = inject(StatisticsService);

  companies = signal<FlatCompanyRecord[]>([]);

  totalCompanies = computed(() => this.companies().length);
  
  avgChurnProbability = computed(() => {
    if (this.companies().length === 0) return 0;
    const totalProbability = this.companies().reduce((acc, company) => {
      return acc + (company.Churn ? 1 : 0);
    }, 0);
    return (totalProbability / this.companies().length) * 100;
  });

  highRiskCompanies = computed(() => {
    return this.companies().filter(c => c.Churn).length;
  });

  ngOnInit(): void {
    this.statisticsService.getCompanies().subscribe(data => {
      this.companies.set(data);
    });
  }
}
