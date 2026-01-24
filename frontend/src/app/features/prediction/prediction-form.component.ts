import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PredictionService } from '../../core/services/prediction.service';
import { ResultsPanelComponent } from './results-panel.component';
import { ResultsModalComponent } from './results-modal.component';
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
 * - Modal de resultados reutilizable
 */
@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ResultsModalComponent],
  templateUrl: './prediction-form.component.html'
})
export class PredictionFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private destroy$ = new Subject<void>();

  // ============================================
  // STATE: Signals para manejo de estado reactivo
  // ============================================
  
  // Sección actual (1: Perfil, 2: Financiero, 3: Engagement)
  currentSection = signal<1 | 2 | 3>(1);

  // Estado del formulario
  companyForm!: FormGroup;
  isLoading = signal(false);
  showResults = signal(false);
  isResultsModalOpen = signal(false);

  // Respuesta de predicción
  predictionResult = signal<PredictionResponse | null>(null);

  // Datos de la empresa y métricas (para exportación)
  currentProfile = signal<Partial<StaticProfile> | null>(null);
  currentMetrics = signal<QuarterlyMetrics | null>(null);

  // Errores
  formErrors = signal<Record<string, string>>({});
  loanFieldErrors = signal<Record<string, string>>({}); // Errores de préstamos en tiempo real
  engagementFieldErrors = signal<Record<string, string>>({}); // Errores de engagement en tiempo real

  // ============================================
  // SIGNALS: Valores reactivos que gatillan computed
  // ============================================
  // Estos signals se actualizan cuando el formulario cambia
  formStateChangeCounter = signal(0); // Contador que se incrementa con cada cambio

  // ============================================
  // COMPUTED: Métricas calculadas en tiempo real
  // ============================================

  // Margen calculado automáticamente (Revenue - Expenses)
  calculatedMargin = computed(() => {
    // Incluir el contador para que se re-evalúe cuando el form cambia
    this.formStateChangeCounter();
    
    const revenue = this.companyForm?.get('ingresos')?.value ?? 0;
    const expenses = this.companyForm?.get('gastos')?.value ?? 0;
    const margin = Number(revenue) - Number(expenses);
    return Math.max(0, margin);
  });

  // Ratio de aprobación de créditos
  creditApprovalRatio = computed(() => {
    this.formStateChangeCounter();
    
    const solicitados = Number(this.companyForm?.get('prestamos_solicitados')?.value) || 0;
    const aprobados = Number(this.companyForm?.get('prestamos_aprobados')?.value) || 0;
    if (solicitados === 0) return 0;
    return (aprobados / solicitados) * 100;
  });

  // Ratio de actividad (días activos / 90 días del trimestre)
  activityRatio = computed(() => {
    this.formStateChangeCounter();
    
    const diasActivos = this.companyForm?.get('trimestre_dias_actividad')?.value || 0;
    return (diasActivos / 90 * 100);
  });

  // Contador de servicios utilizados
  servicesCount = computed(() => {
    this.formStateChangeCounter();
    
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
    this.setupFormChangeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Escucha cambios en el formulario en TIEMPO REAL
   * Aplica validación reactiva y auto-cálculos
   */
  private setupFormChangeListener(): void {
    this.companyForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values) => {
        // AUTO-CÁLCULO 1: Días de inactividad (90 - días activos)
        if (values.trimestre_dias_actividad !== null && values.trimestre_dias_actividad !== undefined) {
          const diasActividad = Number(values.trimestre_dias_actividad);
          const diasInactividad = 90 - diasActividad;
          const currentInactivity = this.companyForm.get('trimestre_dias_inactividad')?.value;
          if (currentInactivity !== diasInactividad) {
            this.companyForm.patchValue(
              { trimestre_dias_inactividad: Math.max(0, diasInactividad) },
              { emitEvent: false }
            );
          }
        }

        // AUTO-CÁLCULO 2: Promedio de login diario (total / 90)
        if (values.total_login_dia !== null && values.total_login_dia !== undefined) {
          const totalLogins = Number(values.total_login_dia);
          const promedio = totalLogins / 90;
          const currentPromedio = this.companyForm.get('promedio_login_dia')?.value;
          if (Math.abs(currentPromedio - promedio) > 0.01) {
            this.companyForm.patchValue(
              { promedio_login_dia: Math.round(promedio * 100) / 100 },
              { emitEvent: false }
            );
          }
        }

        // LÓGICA DE PRÉSTAMOS REACTIVA
        // Fórmula: APROBADOS + CANCELADOS = SOLICITADOS
        this.updateLoanFields(values);

        // Validación REACTIVA de préstamos
        this.updateLoanErrors(values);

        // Validación REACTIVA de engagement (días activos)
        this.updateEngagementErrors(values);

        // Incrementar contador para re-evaluación
        this.formStateChangeCounter.update(c => c + 1);
      });
  }

  /**
   * Auto-ajusta valores de préstamos SOLO lo necesario:
   * Si APROBADOS cambia → CANCELADOS = SOLICITADOS - APROBADOS
   * Otros campos NO afectan los préstamos
   */
  private updateLoanFields(values: any): void {
    const solicitados = Number(values.prestamos_solicitados) || 0;
    const aprobados = Number(values.prestamos_aprobados) || 0;
    const cancelados = Number(values.prestamos_cancelados) || 0;

    // ÚNICO auto-cálculo: Si APROBADOS cambió, recalcular CANCELADOS
    if (aprobados !== null && aprobados !== undefined && solicitados > 0) {
      const canceladosCalculado = Math.max(0, solicitados - aprobados);
      if (Math.abs(cancelados - canceladosCalculado) > 0.01) {
        this.companyForm.patchValue(
          { prestamos_cancelados: canceladosCalculado },
          { emitEvent: false }
        );
      }
    }
  }

  /**
   * Valida préstamos en TIEMPO REAL (mientras escribes)
   * Reglas:
   * 1. APROBADOS no puede ser > SOLICITADOS
   * 2. CANCELADOS no puede ser > SOLICITADOS
   * 3. VIGENTES no puede ser > APROBADOS
   */
  private updateLoanErrors(values: any): void {
    const solicitados = Number(values.prestamos_solicitados) || 0;
    const aprobados = Number(values.prestamos_aprobados) || 0;
    const cancelados = Number(values.prestamos_cancelados) || 0;
    const vigentes = Number(values.prestamos_vigentes) || 0;

    const newErrors: Record<string, string> = {};

    // Regla 1: APROBADOS <= SOLICITADOS
    if (solicitados > 0 && aprobados > solicitados) {
      newErrors['prestamos_aprobados'] = `❌ No puede ser mayor a Solicitados (${solicitados})`;
    }

    // Regla 2: CANCELADOS <= SOLICITADOS
    if (solicitados > 0 && cancelados > solicitados) {
      newErrors['prestamos_cancelados'] = `❌ No puede ser mayor a Solicitados (${solicitados})`;
    }

    // Regla 3: VIGENTES <= APROBADOS
    if (aprobados > 0 && vigentes > aprobados) {
      newErrors['prestamos_vigentes'] = `❌ No puede ser mayor a Aprobados (${aprobados})`;
    }

    // Validación de suma (informativo, no bloquea)
    if (solicitados > 0 && aprobados > 0 && cancelados > 0) {
      const suma = aprobados + cancelados;
      if (suma !== solicitados) {
        // Mostrar referencia pero no bloquear
        // const diff = suma - solicitados;
        // console.log(`Préstamos: ${aprobados} + ${cancelados} = ${suma} (diferencia: ${diff})`);
      }
    }

    this.loanFieldErrors.set(newErrors);
  }

  /**
   * Valida engagement en TIEMPO REAL (mientras escribes)
   * Reglas:
   * 1. DÍAS_ACTIVOS debe ser entre 0 y 90
   * 2. DÍAS_ACTIVOS <= 90 (advertencia si son demasiados pocos)
   */
  private updateEngagementErrors(values: any): void {
    const diasActivos = Number(values.trimestre_dias_actividad) || 0;
    const totalLogins = Number(values.total_login_dia) || 0;

    const newErrors: Record<string, string> = {};

    // Regla 1: Días activos no puede exceder 90
    if (diasActivos > 90) {
      newErrors['trimestre_dias_actividad'] = `❌ No puede exceder 90 días`;
    }

    // Regla 2: Si está vacío y estamos en sección 3, es obligatorio
    if (diasActivos === 0 && this.currentSection() === 3) {
      const existingError = newErrors['trimestre_dias_actividad'];
      if (!existingError) {
        newErrors['trimestre_dias_actividad'] = `⚠️ Ingresa días activos en trimestre`;
      }
    }

    // Regla 3: Total logins no puede ser negativo
    if (totalLogins < 0) {
      newErrors['total_login_dia'] = `❌ No puede ser negativo`;
    }

    this.engagementFieldErrors.set(newErrors);
  }

  /**
   * Inicializa el formulario con validaciones
   * Incluye todos los 30+ campos del EmpresaInput
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

      // Sección 2: Salud Financiera - FINANCIALS (5 campos)
      ingresos: [
        null,
        [Validators.required, Validators.min(0)]
      ],
      gastos: [
        null,
        [Validators.required, Validators.min(0)]
      ],
      deuda: [
        null,
        [Validators.required, Validators.min(0)]
      ],
      activos: [
        null,
        [Validators.required, Validators.min(0)]
      ],

      // CREDIT BEHAVIOR (9 campos)
      prestamos_solicitados: [null, [Validators.required, Validators.min(0)]],
      prestamos_aprobados: [null, [Validators.required, Validators.min(0)]],
      prestamos_cancelados: [null, [Validators.required, Validators.min(0)]],
      prestamos_vigentes: [null, [Validators.required, Validators.min(0)]],
      ticket_promedio_solicitado: [null, [Validators.required, Validators.min(0)]],
      ticket_promedio_aprobado: [null, [Validators.required, Validators.min(0)]],
      monto_solicitado: [null, [Validators.required, Validators.min(0)]],
      monto_aprobado: [null, [Validators.required, Validators.min(0)]],
      tiempo_cancelacion_prestamo: [null, [Validators.required, Validators.min(0)]],

      // Sección 3: Comportamiento en App - APP ENGAGEMENT (4 campos)
      trimestre_dias_actividad: [
        null,
        [Validators.required, Validators.min(0), Validators.max(90)]
      ],
      trimestre_dias_inactividad: [
        null,
        [Validators.required, Validators.min(0), Validators.max(90)]
      ],
      promedio_login_dia: [null, [Validators.required, Validators.min(0)]],
      total_login_dia: [null, [Validators.required, Validators.min(0)]],

      // SERVICES FLAGS (5 campos)
      transferencias: [false],
      pagos: [false],
      creditos: [false],
      inversiones: [false]
    });
  }

  /**
   * Avanza a la siguiente sección
   * Solo avanza si todos los campos de la sección actual son válidos
   */
  nextSection(): void {
    if (!this.isValidCurrentSection()) {
      console.warn('Validación fallida para la sección:', this.currentSection());
      return; // Mostrar errores, no avanzar
    }
    
    const currentValue = this.currentSection();
    if (currentValue < 3) {
      this.currentSection.set((currentValue + 1) as 1 | 2 | 3);
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
        this.validateField('prestamos_cancelados', errors);
        this.validateField('prestamos_vigentes', errors);
        this.validateField('ticket_promedio_solicitado', errors);
        this.validateField('ticket_promedio_aprobado', errors);
        this.validateField('monto_solicitado', errors);
        this.validateField('monto_aprobado', errors);
        this.validateField('tiempo_cancelacion_prestamo', errors);
        
        // Agregar errores de préstamos en tiempo real
        const loanErrors = this.loanFieldErrors();
        Object.assign(errors, loanErrors);
        break;
      case 3: // Engagement
        this.validateField('trimestre_dias_actividad', errors);
        this.validateField('trimestre_dias_inactividad', errors);
        this.validateField('promedio_login_dia', errors);
        this.validateField('total_login_dia', errors);
        break;
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Valida un campo individual
   * Valida aunque no esté dirty/touched (importante para validar steps)
   */
  private validateField(
    fieldName: string,
    errors: Record<string, string>
  ): void {
    const control = this.companyForm.get(fieldName);
    if (!control) return;
    
    // Validar aunque no esté dirty/touched (para step validation)
    if (control.invalid) {
      if (control.hasError('required')) {
        errors[fieldName] = 'Este campo es obligatorio';
      } else if (control.hasError('minlength')) {
        const required = control.errors?.['minlength'].requiredLength;
        errors[fieldName] = `Mínimo ${required} caracteres`;
      } else if (control.hasError('maxlength')) {
        const max = control.errors?.['maxlength'].requiredLength;
        errors[fieldName] = `Máximo ${max} caracteres`;
      } else if (control.hasError('pattern')) {
        if (fieldName === 'cuit') {
          errors[fieldName] = 'CUIT debe ser 11 dígitos sin guiones (ej: 20123456789)';
        } else {
          errors[fieldName] = 'Formato inválido';
        }
      } else if (control.hasError('min')) {
        errors[fieldName] = `No puede ser menor a ${control.errors?.['min'].min}`;
      } else if (control.hasError('max')) {
        errors[fieldName] = `No puede ser mayor a ${control.errors?.['max'].max}`;
      }
    }
  }

  /**
   * Valida las relaciones lógicas entre campos de préstamos
   * Estructura: SOLICITADOS >= APROBADOS y VIGENTES + CANCELADOS <= APROBADOS
   * 
   * NO hay auto-cálculo. El usuario ingresa todos los valores.
   * Esta función SOLO valida que los valores ingresados sean coherentes.
   */
  private validateLoanRelationships(errors: Record<string, string>): void {
    const solicitados = Number(this.companyForm.get('prestamos_solicitados')?.value) || 0;
    const aprobados = Number(this.companyForm.get('prestamos_aprobados')?.value) || 0;
    const vigentes = Number(this.companyForm.get('prestamos_vigentes')?.value) || 0;
    const cancelados = Number(this.companyForm.get('prestamos_cancelados')?.value) || 0;

    // Regla 1: APROBADOS no puede ser mayor que SOLICITADOS
    if (solicitados > 0 && aprobados > solicitados) {
      errors['prestamos_aprobados'] = `❌ No puede ser mayor a Solicitados (${solicitados})`;
    }

    // Regla 2: VIGENTES no puede ser mayor que APROBADOS
    if (aprobados > 0 && vigentes > aprobados) {
      errors['prestamos_vigentes'] = `❌ No puede ser mayor a Aprobados (${aprobados})`;
    }

    // Regla 3: CANCELADOS no puede ser mayor que APROBADOS
    if (aprobados > 0 && cancelados > aprobados) {
      errors['prestamos_cancelados'] = `❌ No puede ser mayor a Aprobados (${aprobados})`;
    }

    // Regla 4: VIGENTES + CANCELADOS debe ser <= APROBADOS
    // En realidad: VIGENTES + CANCELADOS = APROBADOS (idealmente)
    // Pero si el usuario ingresó algo incorrecto, avisamos
    const suma = vigentes + cancelados;
    if (aprobados > 0 && suma !== aprobados) {
      // Mostrar advertencia (pero no bloquea)
      console.warn(
        `⚠️ Relación de préstamos: vigentes (${vigentes}) + cancelados (${cancelados}) = ${suma}, ` +
        `pero aprobados = ${aprobados}. Idealmente deberían ser iguales.`
      );
    }
  }

  /**
   * Envía el formulario para predicción
   * Ahora llama al AI Service con HTTP real
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
      const values = this.companyForm.value;
      
      // Guarda los datos actuales
      this.currentMetrics.set(quarterlyData);
      this.currentProfile.set(profile);
      
      // Llamar al service con metadatos de empresa
      this.predictionService.predict(
        quarterlyData,
        values.cuit,
        values.nombre_empresa,
        values.sector,
        values.provincia
      ).subscribe({
        next: (response) => {
          this.predictionResult.set(response);
          this.isResultsModalOpen.set(true);  // Abrir modal de resultados
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error en predicción:', error);
          this.isLoading.set(false);
          alert(`❌ ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading.set(false);
      alert('Error al procesar los datos. Intenta de nuevo.');
    }
  }

  /**
   * Construye el objeto QuarterlyMetrics desde los valores del formulario
   * Mapea los campos del formulario a la estructura QuarterlyMetrics
   */
  private buildQuarterlyMetrics(): QuarterlyMetrics {
    const values = this.companyForm.value;

    const financials: Financials = {
      Ingresos: Number(values.ingresos) || 0,
      Gastos: Number(values.gastos) || 0,
      Margen: (Number(values.ingresos) || 0) - (Number(values.gastos) || 0),
      Deuda: Number(values.deuda) || 0,
      Activos: Number(values.activos) || 0
    };

    const creditBehavior: CreditBehavior = {
      Prestamos_Solicitados: Number(values.prestamos_solicitados) || 0,
      Prestamos_Aprobados: Number(values.prestamos_aprobados) || 0,
      Prestamos_Cancelados: Number(values.prestamos_cancelados) || 0,
      Prestamos_Vigentes: Number(values.prestamos_vigentes) || 0,
      Ticket_Promedio_Solicitado: Number(values.ticket_promedio_solicitado) || 0,
      Ticket_Promedio_Aprobado: Number(values.ticket_promedio_aprobado) || 0,
      Monto_Solicitado: Number(values.monto_solicitado) || 0,
      Monto_Aprobado: Number(values.monto_aprobado) || 0,
      Tiempo_Cancelacion_Prestamo: Number(values.tiempo_cancelacion_prestamo) || 0
    };

    const appEngagement: AppEngagement = {
      Trimestre_Dias_Actividad: Number(values.trimestre_dias_actividad) || 0,
      Trimestre_Dias_Inactividad: Number(values.trimestre_dias_inactividad) || 0,
      Promedio_Login_Dia: Number(values.promedio_login_dia) || 0,
      Total_Login_Dia: Number(values.total_login_dia) || 0
    };

    const servicesFlags: ServicesFlags = {
      Transferencias: !!values.transferencias,
      Pagos: !!values.pagos,
      Creditos: !!values.creditos,
      Inversiones: !!values.inversiones,
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
   * NOTA: CUIT se mantiene como string para preservar formato (11 dígitos)
   */
  private buildStaticProfile(): Partial<StaticProfile> {
    const values = this.companyForm.value;
    return {
      CUIT: values.cuit?.trim() || 'N/A', // Mantener como string, no parseInt
      Nombre_Empresa: values.nombre_empresa?.trim() || 'N/A',
      Sector: values.sector || 'N/A',
      Provincia: values.provincia || 'N/A'
    };
  }

  /**
   * Helpers para el template
   */
  isSection(section: number): boolean {
    return this.currentSection() === section;
  }

  getFieldError(fieldName: string): string | null {
    // Primero buscar en errores de préstamos (tiempo real)
    const loanError = this.loanFieldErrors()[fieldName];
    if (loanError) return loanError;

    // Luego buscar en errores de engagement (tiempo real)
    const engagementError = this.engagementFieldErrors()[fieldName];
    if (engagementError) return engagementError;
    
    // Si no, buscar en errores del formulario
    return this.formErrors()[fieldName] || null;
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.companyForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Abre el modal de resultados
   */
  openResultsModal(): void {
    this.isResultsModalOpen.set(true);
  }

  /**
   * Cierra el modal de resultados
   */
  closeResultsModal(): void {
    this.isResultsModalOpen.set(false);
  }

  /**
   * Inicia una nueva predicción desde el modal
   */
  startNewPredictionFromModal(): void {
    this.resetForm();
    this.closeResultsModal();
  }
}

