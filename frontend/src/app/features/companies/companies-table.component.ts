import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesDataService, CompanyData } from '../../core/services/companies-data.service';
import { PredictionService } from '../../core/services/prediction.service';
import { QuarterlyMetrics, PredictionResponse } from '../../core/models/churn.interface';

/**
 * CompaniesTableComponent
 * Tabla para visualizar empresas existentes y predecir su churn
 */
@Component({
  selector: 'app-companies-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <!-- Modal de Predicción -->
      <div *ngIf="selectedCompany() && predictedResult()" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-96 overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900">Resultado de Predicción</h3>
            <button (click)="selectedCompany.set(null); predictedResult.set(null)"
                    class="text-slate-500 hover:text-slate-700 text-xl">✕</button>
          </div>

          <!-- Empresa -->
          <div class="bg-slate-50 p-4 rounded-lg">
            <p class="text-sm text-slate-600">{{ selectedCompany()!.NOMBRE_EMPRESA }}</p>
            <p class="text-lg font-bold text-slate-900">CUIT: {{ selectedCompany()!.CUIT }}</p>
          </div>

          <!-- Resultado -->
          <div [class.bg-red-50]="(predictedResult()!.churn_probability || 0) > 0.7"
               [class.bg-amber-50]="(predictedResult()!.churn_probability || 0) > 0.4 && (predictedResult()!.churn_probability || 0) <= 0.7"
               [class.bg-emerald-50]="(predictedResult()!.churn_probability || 0) <= 0.4"
               class="p-4 rounded-lg border-2"
               [class.border-red-200]="(predictedResult()!.churn_probability || 0) > 0.7"
               [class.border-amber-200]="(predictedResult()!.churn_probability || 0) > 0.4 && (predictedResult()!.churn_probability || 0) <= 0.7"
               [class.border-emerald-200]="(predictedResult()!.churn_probability || 0) <= 0.4">
            <div class="flex items-center justify-between">
              <span class="font-semibold" 
                    [class.text-red-900]="(predictedResult()!.churn_probability || 0) > 0.7"
                    [class.text-amber-900]="(predictedResult()!.churn_probability || 0) > 0.4 && (predictedResult()!.churn_probability || 0) <= 0.7"
                    [class.text-emerald-900]="(predictedResult()!.churn_probability || 0) <= 0.4">
                Probabilidad de Churn
              </span>
              <span class="text-3xl font-bold"
                    [class.text-red-600]="(predictedResult()!.churn_probability || 0) > 0.7"
                    [class.text-amber-600]="(predictedResult()!.churn_probability || 0) > 0.4 && (predictedResult()!.churn_probability || 0) <= 0.7"
                    [class.text-emerald-600]="(predictedResult()!.churn_probability || 0) <= 0.4">
                {{ ((predictedResult()!.churn_probability || 0) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>

          <!-- Red Flags -->
          <div *ngIf="predictedResult()!.red_flags && predictedResult()!.red_flags.length > 0">
            <p class="font-semibold text-slate-900 mb-2">🚩 Alertas Detectadas:</p>
            <ul class="space-y-2">
              <li *ngFor="let flag of predictedResult()!.red_flags" 
                  class="text-sm p-2 bg-orange-50 border border-orange-200 rounded">
                • {{ typeof flag === 'string' ? flag : flag.description }}
              </li>
            </ul>
          </div>

          <!-- Confianza -->
          <div *ngIf="predictedResult()!.confidence" class="text-sm text-slate-600">
            <p>Confianza del modelo: <strong>{{ ((predictedResult()!.confidence || 0) * 100).toFixed(0) }}%</strong></p>
            <p>Timestamp: {{ predictedResult()!.timestamp }}</p>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4 border-t">
            <button (click)="selectedCompany.set(null); predictedResult.set(null)"
                    class="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition">
              Cerrar
            </button>
          </div>
        </div>
      </div>
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
  selectedCompany = signal<CompanyData | null>(null);
  predictedResult = signal<PredictionResponse | null>(null);

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
    this.selectedCompany.set(company);

    // Construir métricas desde los datos disponibles
    const mockMetrics: QuarterlyMetrics = {
      Periodo_Fiscal: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
      financials: {
        Ingresos: company.INGRESOS || 0,
        Gastos: company.GASTOS || 0,
        Margen: (company.INGRESOS || 0) - (company.GASTOS || 0),
        Deuda: company.DEUDA || 0,
        Activos: company.ACTIVOS || 0
      },
      credit_behavior: {
        Prestamos_Solicitados: 0,
        Prestamos_Aprobados: 0,
        Prestamos_Cancelados: 0,
        Prestamos_Vigentes: 0,
        Ticket_Promedio_Solicitado: 0,
        Ticket_Promedio_Aprobado: 0,
        Monto_Solicitado: 0,
        Monto_Aprobado: 0,
        Tiempo_Cancelacion_Prestamo: 0
      },
      app_engagement: {
        Trimestre_Dias_Actividad: 60,
        Trimestre_Dias_Inactividad: 30,
        Promedio_Login_Dia: 2,
        Total_Login_Dia: 120
      },
      services_flags: {
        Transferencias: true,
        Pagos: true,
        Creditos: true,
        Inversiones: false,
        Servicios_Utilizados: 3
      }
    };

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
      },
      error: (error) => {
        console.error('Error prediciendo churn:', error);
        alert(`Error: ${error.message}`);
        this.loadingCuit.set(null);
      }
    });
  }
}
