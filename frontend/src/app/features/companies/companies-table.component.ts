import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesDataService, CompanyData } from '../../core/services/companies-data.service';
import { PredictionService } from '../../core/services/prediction.service';
import { QuarterlyMetrics, PredictionResponse, StaticProfile } from '../../core/models/churn.interface';
import { ResultsModalComponent } from '../prediction/results-modal.component';

/**
 * CompaniesTableComponent
 * Tabla para visualizar empresas existentes y predecir su churn
 */
@Component({
  selector: 'app-companies-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ResultsModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">📊 Empresas en Base de Datos</h2>
        <p class="text-slate-600">Visualiza empresas existentes y predice su riesgo de churn</p>
      </div>

      <!-- Búsqueda -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex gap-3">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterCompanies()"
            placeholder="Buscar por CUIT, nombre, sector o provincia..."
            class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
          <button
            (click)="loadCompanies()"
            class="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            🔄 Recargar
          </button>
        </div>
        <p class="text-sm text-slate-500 mt-2">
          Mostrando {{ filteredCompanies().length }} de {{ allCompanies().length }} empresas
        </p>
      </div>

      <!-- Tabla -->
      <div *ngIf="filteredCompanies().length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">CUIT</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Empresa</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Sector</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Provincia</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Ingresos</th>
                <th class="px-4 py-3 text-left font-semibold text-slate-900">Empleados</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let company of filteredCompanies()" 
                  class="border-b border-slate-200 hover:bg-slate-50 transition">
                <td class="px-4 py-3 font-mono text-slate-700">{{ company.CUIT }}</td>
                <td class="px-4 py-3 font-medium text-slate-900">{{ company.NOMBRE_EMPRESA }}</td>
                <td class="px-4 py-3 text-slate-700">{{ company.SECTOR }}</td>
                <td class="px-4 py-3 text-slate-700">{{ company.PROVINCIA }}</td>
                <td class="px-4 py-3 text-slate-700">
                  {{ company.INGRESOS ? (company.INGRESOS | currency: 'ARS':'symbol':'1.0-0') : 'N/A' }}
                </td>
                <td class="px-4 py-3 text-slate-700">{{ company.EMPLEADOS || 'N/A' }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    (click)="predictChurn(company)"
                    [disabled]="loadingCuit() === company.CUIT"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ loadingCuit() === company.CUIT ? '⏳ Prediciendo...' : '🔮 Predecir' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sin resultados -->
      <div *ngIf="filteredCompanies().length === 0 && !isLoading()" 
           class="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <p class="text-amber-900 font-medium">No se encontraron empresas que coincidan con tu búsqueda</p>
      </div>

      <!-- Cargando -->
      <div *ngIf="isLoading()" class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p class="text-blue-900 font-medium">⏳ Cargando empresas...</p>
      </div>

      <!-- Modal de Resultados -->
      <app-results-modal
        [isOpen]="isModalOpen()"
        [predictionResult]="predictedResult()"
        [profile]="selectedCompanyProfile()"
        [metrics]="currentMetrics()"
        (closeModal)="closeModal()">
      </app-results-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CompaniesTableComponent implements OnInit {
  private companiesService = inject(CompaniesDataService);
  private predictionService = inject(PredictionService);

  allCompanies = signal<CompanyData[]>([]);
  filteredCompanies = signal<CompanyData[]>([]);
  searchQuery = '';
  isLoading = signal(false);
  loadingCuit = signal<string | null>(null);
  
  selectedCompanyProfile = signal<Partial<StaticProfile> | null>(null);
  predictedResult = signal<PredictionResponse | null>(null);
  currentMetrics = signal<QuarterlyMetrics | null>(null);
  isModalOpen = signal(false);

  ngOnInit(): void {
    this.loadCompanies();
  }

  /**
   * Carga empresas desde el servicio
   */
  loadCompanies(): void {
    this.isLoading.set(true);
    this.companiesService.loadCompaniesData().subscribe({
      next: (companies) => {
        this.allCompanies.set(companies);
        this.filterCompanies();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando empresas:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Filtra empresas según búsqueda
   */
  filterCompanies(): void {
    const results = this.companiesService.searchCompanies(
      this.searchQuery,
      this.allCompanies()
    );
    this.filteredCompanies.set(results);
  }

  /**
   * Predice churn para una empresa
   */
  predictChurn(company: CompanyData): void {
    this.loadingCuit.set(company.CUIT!.toString());
    
    const profile: Partial<StaticProfile> = {
      CUIT: company.CUIT,
      Nombre_Empresa: company.NOMBRE_EMPRESA,
      Sector: company.SECTOR,
      Provincia: company.PROVINCIA,
    };
    this.selectedCompanyProfile.set(profile);

    const mockMetrics: QuarterlyMetrics = this.createMockMetrics(company);
    this.currentMetrics.set(mockMetrics);

    this.predictionService.predict(
      mockMetrics,
      company.CUIT!.toString(),
      company.NOMBRE_EMPRESA,
      company.SECTOR,
      company.PROVINCIA
    ).subscribe({
      next: (result) => {
        this.predictedResult.set(result);
        this.loadingCuit.set(null);
        this.isModalOpen.set(true);
      },
      error: (error) => {
        console.error('Error prediciendo churn:', error);
        alert(`Error: ${error.message}`);
        this.loadingCuit.set(null);
      }
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.predictedResult.set(null);
    this.selectedCompanyProfile.set(null);
    this.currentMetrics.set(null);
  }
  
  private createMockMetrics(company: CompanyData): QuarterlyMetrics {
    return {
      Periodo_Fiscal: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
      financials: {
        Ingresos: company.INGRESOS || Math.random() * 1000000,
        Gastos: company.GASTOS || Math.random() * 500000,
        Margen: (company.INGRESOS || 0) - (company.GASTOS || 0),
        Deuda: company.DEUDA || Math.random() * 200000,
        Activos: company.ACTIVOS || Math.random() * 2000000
      },
      credit_behavior: {
        Prestamos_Solicitados: Math.floor(Math.random() * 20),
        Prestamos_Aprobados: Math.floor(Math.random() * 15),
        Prestamos_Cancelados: Math.floor(Math.random() * 5),
        Prestamos_Vigentes: Math.floor(Math.random() * 10),
        Ticket_Promedio_Solicitado: Math.random() * 50000,
        Ticket_Promedio_Aprobado: Math.random() * 40000,
        Monto_Solicitado: Math.random() * 1000000,
        Monto_Aprobado: Math.random() * 800000,
        Tiempo_Cancelacion_Prestamo: Math.floor(Math.random() * 30)
      },
      app_engagement: {
        Trimestre_Dias_Actividad: Math.floor(Math.random() * 90),
        Trimestre_Dias_Inactividad: 90 - (this.currentMetrics()?.app_engagement?.Trimestre_Dias_Actividad || 0),
        Promedio_Login_Dia: Math.random() * 5,
        Total_Login_Dia: Math.floor(Math.random() * 450)
      },
      services_flags: {
        Transferencias: Math.random() > 0.5,
        Pagos: Math.random() > 0.5,
        Creditos: Math.random() > 0.5,
        Inversiones: Math.random() > 0.5,
        Servicios_Utilizados: Math.floor(Math.random() * 5)
      }
    };
  }
}

