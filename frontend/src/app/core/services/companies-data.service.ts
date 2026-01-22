import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CompanyData {
  CUIT: string | number;
  NOMBRE_EMPRESA: string;
  SECTOR: string;
  PROVINCIA: string;
  INGRESOS?: number;
  GASTOS?: number;
  ACTIVOS?: number;
  DEUDA?: number;
  EMPLEADOS?: number;
  Churn?: boolean | number;
  [key: string]: any;
}

/**
 * CompaniesDataService
 * Servicio para cargar y gestionar datos de empresas del dataset
 */
@Injectable({
  providedIn: 'root'
})
export class CompaniesDataService {
  private readonly http = inject(HttpClient);
  private readonly DATA_URL = '/assets/data/dataset_empresas_fintech_v2.7.csv';
  private companiesCache: CompanyData[] = [];

  /**
   * Carga datos de empresas del CSV
   */
  loadCompaniesData(): Observable<CompanyData[]> {
    // Si ya está en caché, retornar desde caché
    if (this.companiesCache.length > 0) {
      return of(this.companiesCache);
    }

    // Intentar cargar del CSV
    return this.http.get(this.DATA_URL, { responseType: 'text' }).pipe(
      map(csvData => this._parseCSV(csvData)),
      catchError(error => {
        console.warn('No se pudo cargar CSV del dataset, usando datos mock', error);
        return of(this._generateMockData());
      })
    );
  }

  /**
   * Busca empresas por criterio
   */
  searchCompanies(query: string, companies: CompanyData[]): CompanyData[] {
    if (!query.trim()) return companies;
    
    const q = query.toLowerCase();
    return companies.filter(c => 
      (c.CUIT?.toString().includes(q)) ||
      (c.NOMBRE_EMPRESA?.toLowerCase().includes(q)) ||
      (c.SECTOR?.toLowerCase().includes(q)) ||
      (c.PROVINCIA?.toLowerCase().includes(q))
    );
  }

  /**
   * Parsea CSV manualmente
   */
  private _parseCSV(csv: string): CompanyData[] {
    const lines = csv.split('\n').slice(1); // Skip header
    const companies: CompanyData[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const values = this._parseCSVLine(line);
      if (values.length >= 4) {
        companies.push({
          CUIT: values[0],
          NOMBRE_EMPRESA: values[1],
          SECTOR: values[2],
          PROVINCIA: values[3],
          INGRESOS: this._toNumber(values[4]),
          GASTOS: this._toNumber(values[5]),
          DEUDA: this._toNumber(values[6]),
          ACTIVOS: this._toNumber(values[7]),
          EMPLEADOS: this._toNumber(values[8]),
          Churn: values[9] === '1' || values[9]?.toLowerCase() === 'true'
        });
      }
    }

    this.companiesCache = companies;
    return companies;
  }

  /**
   * Parsea una línea CSV respetando comillas
   */
  private _parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Convierte string a número
   */
  private _toNumber(value: any): number | undefined {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Genera datos mock para testing
   */
  private _generateMockData(): CompanyData[] {
    return [
      {
        CUIT: '20123456789',
        NOMBRE_EMPRESA: 'Tech Solutions S.A.',
        SECTOR: 'Tecnología',
        PROVINCIA: 'Buenos Aires',
        INGRESOS: 5000000,
        GASTOS: 3000000,
        DEUDA: 1000000,
        ACTIVOS: 6000000,
        EMPLEADOS: 50,
        Churn: false
      },
      {
        CUIT: '20234567890',
        NOMBRE_EMPRESA: 'FinTech Innovators',
        SECTOR: 'Fintech',
        PROVINCIA: 'CABA',
        INGRESOS: 8000000,
        GASTOS: 5000000,
        DEUDA: 2000000,
        ACTIVOS: 10000000,
        EMPLEADOS: 80,
        Churn: true
      },
      {
        CUIT: '20345678901',
        NOMBRE_EMPRESA: 'Retail Plus Ltd.',
        SECTOR: 'Retail',
        PROVINCIA: 'Córdoba',
        INGRESOS: 3500000,
        GASTOS: 2500000,
        DEUDA: 500000,
        ACTIVOS: 4500000,
        EMPLEADOS: 35,
        Churn: false
      },
      {
        CUIT: '20456789012',
        NOMBRE_EMPRESA: 'Services & Co.',
        SECTOR: 'Servicios',
        PROVINCIA: 'Mendoza',
        INGRESOS: 2000000,
        GASTOS: 1200000,
        DEUDA: 300000,
        ACTIVOS: 2500000,
        EMPLEADOS: 20,
        Churn: true
      },
      {
        CUIT: '20567890123',
        NOMBRE_EMPRESA: 'Manufacturing Pro',
        SECTOR: 'Manufactura',
        PROVINCIA: 'Buenos Aires',
        INGRESOS: 12000000,
        GASTOS: 8000000,
        DEUDA: 3000000,
        ACTIVOS: 15000000,
        EMPLEADOS: 150,
        Churn: false
      }
    ];
  }
}
