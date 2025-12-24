import { Routes } from '@angular/router';
import { PredictionFormComponent } from './features/prediction/prediction-form.component';

export const routes: Routes = [
  {
    path: '',
    component: PredictionFormComponent,
    data: { title: 'ChurnInsight - Predicción de Churn' }
  },
  {
    path: 'prediction',
    component: PredictionFormComponent,
    data: { title: 'Nueva Predicción' }
  }
];
