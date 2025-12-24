import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../../core/services/prediction.service';
import { ResultsPanelComponent } from './results-panel.component';
import { 
  QuarterlyMetrics, 
  StaticProfile, 
  PredictionResponse,
  Financials,
  CreditBehavior,
  AppEngagement,
  ServicesFlags
} from '../../core/models/churn.interface';

/**
 * PredictionFormComponent
 * Formulario de predicción de churn con 3 secciones progresivas
 * 
 * Arquitectura:
 * - Standalone component (Angular 19+)
 * - Signals para estado reactivo
 * - Reactive Forms para validación
 * - Tailwind CSS para estilos
 */
@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ResultsPanelComponent],
  templateUrl: './prediction-form.component.html'
})
export class PredictionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);

  // ============================================
  // STATE: Signals para manejo de estado reactivo
  // ============================================
  
  // Sección actual (1: Perfil, 2: Financiero, 3: Engagement)
  currentSection = signal<1 | 2 | 3>(1);

  // Estado del formulario
  companyForm!: FormGroup;
  isLoading = signal(false);
  showResults = signal(false);

  // Respuesta de predicción
  predictionResult = signal<PredictionResponse | null>(null);

  // Datos de la empresa y métricas (para exportación)
  currentProfile = signal<Partial<StaticProfile> | null>(null);
  currentMetrics = signal<QuarterlyMetrics | null>(null);

  // Errores
  formErrors = signal<Record<string, string>>({});

  // ============================================
  // COMPUTED: Métricas calculadas en tiempo real
  // ============================================

  // Margen calculado automáticamente (Revenue - Expenses)
  calculatedMargin = computed(() => {
    const revenue = this.companyForm?.get('ingresos')?.value || 0;
    const expenses = this.companyForm?.get('gastos')?.value || 0;
    return Math.max(0, revenue - expenses);
  });

  // Ratio de aprobación de créditos
  creditApprovalRatio = computed(() => {
    const solicitados = this.companyForm?.get('prestamos_solicitados')?.value || 0;
    if (solicitados === 0) return 0;
    const aprobados = this.companyForm?.get('prestamos_aprobados')?.value || 0;
    return solicitados > 0 ? (aprobados / solicitados * 100) : 0;
  });

  // Ratio de actividad (días activos / 90 días del trimestre)
  activityRatio = computed(() => {
    const diasActivos = this.companyForm?.get('trimestre_dias_actividad')?.value || 0;
    return (diasActivos / 90 * 100);
  });

  // Contador de servicios utilizados
  servicesCount = computed(() => {
    const transferencias = this.companyForm?.get('transferencias')?.value ? 1 : 0;
    const pagos = this.companyForm?.get('pagos')?.value ? 1 : 0;
    const creditos = this.companyForm?.get('creditos')?.value ? 1 : 0;
    const inversiones = this.companyForm?.get('inversiones')?.value ? 1 : 0;
    return transferencias + pagos + creditos + inversiones;
  });

  // Color de indicador según ratio de actividad
  activityIndicatorColor = computed(() => {
    const ratio = this.activityRatio();
    if (ratio > 70) return 'bg-emerald-500';
    if (ratio > 40) return 'bg-amber-500';
    return 'bg-red-500';
  });

  // Clase de progreso visual del formulario
  progressPercentage = computed(() => {
    return (this.currentSection() / 3) * 100;
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initializeForm(): void {
    this.companyForm = this.fb.group({
      // Sección 1: Perfil de Empresa
      cuit: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern(/^\d{11}$/)
        ]
      ],
      nombre_empresa: ['', [Validators.required, Validators.minLength(3)]],
      sector: ['', Validators.required],
      provincia: ['', Validators.required],

      // Sección 2: Salud Financiera
      ingresos: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      gastos: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      deuda: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      activos: [
        0,
        [Validators.required, Validators.min(0)]
      ],

      // Créditos
      prestamos_solicitados: [0, [Validators.required, Validators.min(0)]],
      prestamos_aprobados: [0, [Validators.required, Validators.min(0)]],
      prestamos_vigentes: [0, [Validators.required, Validators.min(0)]],
      monto_solicitado: [0, [Validators.required, Validators.min(0)]],
      monto_aprobado: [0, [Validators.required, Validators.min(0)]],

      // Sección 3: Comportamiento en App
      trimestre_dias_actividad: [
        0,
        [Validators.required, Validators.min(0), Validators.max(90)]
      ],
      trimestre_dias_inactividad: [
        0,
        [Validators.required, Validators.min(0), Validators.max(90)]
      ],
      promedio_login_dia: [0, [Validators.required, Validators.min(0)]],
      total_login_dia: [0, [Validators.required, Validators.min(0)]],

      // Servicios
      transferencias: [false],
      pagos: [false],
      creditos: [false],
      inversiones: [false]
    });
  }

  /**
   * Avanza a la siguiente sección
   */
  nextSection(): void {
    if (this.isValidCurrentSection()) {
      const currentValue = this.currentSection();
      if (currentValue < 3) {
        this.currentSection.set((currentValue + 1) as 1 | 2 | 3);
      }
    }
  }

  /**
   * Retrocede a la sección anterior
   */
  prevSection(): void {
    const currentValue = this.currentSection();
    if (currentValue > 1) {
      this.currentSection.set((currentValue - 1) as 1 | 2 | 3);
    }
  }

  /**
   * Valida los campos de la sección actual
   */
  private isValidCurrentSection(): boolean {
    const section = this.currentSection();
    const errors: Record<string, string> = {};

    switch (section) {
      case 1: // Perfil
        this.validateField('cuit', errors);
        this.validateField('nombre_empresa', errors);
        this.validateField('sector', errors);
        this.validateField('provincia', errors);
        break;
      case 2: // Financiero
        this.validateField('ingresos', errors);
        this.validateField('gastos', errors);
        this.validateField('deuda', errors);
        this.validateField('activos', errors);
        this.validateField('prestamos_solicitados', errors);
        this.validateField('prestamos_aprobados', errors);
        break;
      case 3: // Engagement
        this.validateField('trimestre_dias_actividad', errors);
        this.validateField('promedio_login_dia', errors);
        break;
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Valida un campo individual
   */
  private validateField(
    fieldName: string,
    errors: Record<string, string>
  ): void {
    const control = this.companyForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.hasError('required')) {
        errors[fieldName] = 'Este campo es obligatorio';
      } else if (control.hasError('minlength')) {
        errors[fieldName] = `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
      } else if (control.hasError('pattern')) {
        errors[fieldName] = 'Formato inválido (CUIT: 11 dígitos)';
      } else if (control.hasError('min')) {
        errors[fieldName] = 'No puede ser negativo';
      }
    }
  }

  /**
   * Envía el formulario para predicción
   */
  async submitPrediction(): Promise<void> {
    if (!this.companyForm.valid) {
      alert('Completa todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    this.showResults.set(false);

    try {
      const quarterlyData = this.buildQuarterlyMetrics();
      const profile = this.buildStaticProfile();
      
      // Guarda los datos actuales
      this.currentMetrics.set(quarterlyData);
      this.currentProfile.set(profile);
      
      this.predictionService.predict(quarterlyData).subscribe({
        next: (response) => {
          this.predictionResult.set(response);
          this.showResults.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error en predicción:', error);
          this.isLoading.set(false);
          alert('Error al obtener predicción. Intenta de nuevo.');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading.set(false);
    }
  }

  /**
   * Construye el objeto QuarterlyMetrics desde los valores del formulario
   */
  private buildQuarterlyMetrics(): QuarterlyMetrics {
    const values = this.companyForm.value;

    const financials: Financials = {
      Ingresos: values.ingresos,
      Gastos: values.gastos,
      Margen: values.ingresos - values.gastos,
      Deuda: values.deuda,
      Activos: values.activos
    };

    const creditBehavior: CreditBehavior = {
      Prestamos_Solicitados: values.prestamos_solicitados,
      Prestamos_Aprobados: values.prestamos_aprobados,
      Prestamos_Cancelados: 0, // Puede agregarse al formulario
      Prestamos_Vigentes: values.prestamos_vigentes,
      Ticket_Promedio_Solicitado: values.monto_solicitado / Math.max(values.prestamos_solicitados, 1),
      Ticket_Promedio_Aprobado: values.monto_aprobado / Math.max(values.prestamos_aprobados, 1),
      Monto_Solicitado: values.monto_solicitado,
      Monto_Aprobado: values.monto_aprobado,
      Tiempo_Cancelacion_Prestamo: 60 // Valor por defecto
    };

    const appEngagement: AppEngagement = {
      Trimestre_Dias_Actividad: values.trimestre_dias_actividad,
      Trimestre_Dias_Inactividad: values.trimestre_dias_inactividad,
      Promedio_Login_Dia: values.promedio_login_dia,
      Total_Login_Dia: values.total_login_dia
    };

    const servicesFlags: ServicesFlags = {
      Transferencias: values.transferencias,
      Pagos: values.pagos,
      Creditos: values.creditos,
      Inversiones: values.inversiones,
      Servicios_Utilizados: this.servicesCount()
    };

    return {
      Periodo_Fiscal: new Date().toISOString().split('T')[0],
      financials,
      credit_behavior: creditBehavior,
      app_engagement: appEngagement,
      services_flags: servicesFlags
    };
  }

  /**
   * Reinicia el formulario
   */
  resetForm(): void {
    this.companyForm.reset();
    this.currentSection.set(1);
    this.showResults.set(false);
    this.predictionResult.set(null);
    this.currentProfile.set(null);
    this.currentMetrics.set(null);
    this.formErrors.set({});
  }

  /**
   * Construye el perfil estático desde los valores del formulario
   */
  private buildStaticProfile(): Partial<StaticProfile> {
    const values = this.companyForm.value;
    return {
      CUIT: parseInt(values.cuit, 10),
      Nombre_Empresa: values.nombre_empresa,
      Sector: values.sector,
      Provincia: values.provincia
    };
  }

  /**
   * Helpers para el template
   */
  isSection(section: number): boolean {
    return this.currentSection() === section;
  }

  getFieldError(fieldName: string): string | null {
    return this.formErrors()[fieldName] || null;
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.companyForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

