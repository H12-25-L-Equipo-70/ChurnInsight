import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CompanyRecord, FlatCompanyRecord } from '../models/churn.interface';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private mockData: FlatCompanyRecord[] = [];

  constructor() {
    this.generateMockData(50);
  }

  getCompanies(): Observable<FlatCompanyRecord[]> {
    return of(this.mockData);
  }

  private generateMockData(count: number): void {
    const sectors = ['Technology', 'Retail', 'Healthcare', 'Finance', 'Manufacturing'];
    const provinces = ['Buenos Aires', 'Cordoba', 'Santa Fe', 'Mendoza', 'Tucuman'];

    for (let i = 0; i < count; i++) {
      const ingresos = this.getRandomInt(100000, 5000000);
      const gastos = ingresos * (this.getRandomInt(50, 95) / 100);
      const churn = Math.random() < 0.3;

      this.mockData.push({
        CUIT: this.getRandomInt(20000000000, 39999999999).toString(),
        Nombre_Empresa: `Company ${i + 1}`,
        Sector: sectors[this.getRandomInt(0, sectors.length - 1)],
        Provincia: provinces[this.getRandomInt(0, provinces.length - 1)],
        Año_Fundación: this.getRandomInt(2000, 2022),
        Empleados: this.getRandomInt(5, 200),
        Periodo_Fiscal: '2025-Q4',
        Ingresos: ingresos,
        Gastos: gastos,
        Margen: ingresos - gastos,
        Deuda: this.getRandomInt(0, 1000000),
        Activos: this.getRandomInt(500000, 10000000),
        Prestamos_Solicitados: this.getRandomInt(0, 20),
        Prestamos_Aprobados: this.getRandomInt(0, 20),
        Prestamos_Cancelados: this.getRandomInt(0, 5),
        Prestamos_Vigentes: this.getRandomInt(0, 10),
        Ticket_Promedio_Solicitado: this.getRandomInt(10000, 500000),
        Ticket_Promedio_Aprobado: this.getRandomInt(10000, 500000),
        Monto_Solicitado: this.getRandomInt(100000, 10000000),
        Monto_Aprobado: this.getRandomInt(100000, 10000000),
        Tiempo_Cancelacion_Prestamo: this.getRandomInt(30, 365),
        Trimestre_Dias_Actividad: this.getRandomInt(0, 90),
        Trimestre_Dias_Inactividad: this.getRandomInt(0, 90),
        Promedio_Login_Dia: Math.random() * 10,
        Total_Login_Dia: this.getRandomInt(0, 1000),
        Transferencias: Math.random() < 0.5,
        Pagos: Math.random() < 0.5,
        Creditos: Math.random() < 0.5,
        Inversiones: Math.random() < 0.5,
        Servicios_Utilizados: this.getRandomInt(1, 4),
        Churn: churn,
        Churn_Date: churn ? new Date().toISOString() : null,
      });
    }
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
