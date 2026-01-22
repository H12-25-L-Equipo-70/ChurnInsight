import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PredictionFormComponent } from './features/prediction/prediction-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CompaniesTableComponent } from './features/companies/companies-table.component';
import { PredictionsHistoryComponent } from './features/predictions/predictions-history.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'prediction',
        component: PredictionFormComponent,
        data: { title: 'Nueva Predicción' }
      },
      {
        path: 'companies',
        component: CompaniesTableComponent,
        data: { title: 'Empresas' }
      },
      {
        path: 'history',
        component: PredictionsHistoryComponent,
        data: { title: 'Historial de Predicciones' }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: '',
        redirectTo: 'prediction',
        pathMatch: 'full'
      }
    ]
  }
];
