import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PredictionFormComponent } from './features/prediction/prediction-form.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

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
