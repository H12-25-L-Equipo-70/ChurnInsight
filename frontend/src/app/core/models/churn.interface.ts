/**
 * ChurnInsight Data Models
 * Mapeo de estructura jerárquica del dataset_empresas_fintech_v2.7.json
 * Sector: Fintech Argentina (Pymer)
 */

/**
 * Perfil estático de la empresa
 * Datos fijos que no cambian entre trimestres
 */
export interface StaticProfile {
  CUIT: string | number; // 11 dígitos: guardar como string para preservar formato
  Nombre_Empresa: string;
  Tipo_Sociedad?: string; // Ej: S.A., S.R.L., etc.
  Sector: string; // Ej: Tecnología, Retail, Servicios, etc.
  Provincia: string;
  Año_Fundación?: number;
  Empleados?: number;
  Telefono?: number;
  Direccion?: string;
}

/**
 * Datos financieros de un trimestre
 * Incluye: Ingresos, Gastos, Margen, Deuda, Activos
 */
export interface Financials {
  Ingresos: number; // Revenue
  Gastos: number; // Expenses
  Margen: number; // Profit Margin (Revenue - Expenses)
  Deuda: number; // Debt
  Activos: number; // Assets
}

/**
 * Comportamiento crediticio de la empresa
 * Seguimiento de solicitudes, aprobaciones y vigencia de préstamos
 */
export interface CreditBehavior {
  Prestamos_Solicitados: number; // Cantidad de préstamos solicitados
  Prestamos_Aprobados: number; // Cantidad aprobados
  Prestamos_Cancelados: number; // Cantidad cancelados
  Prestamos_Vigentes: number; // Cantidad activos en vigencia
  Ticket_Promedio_Solicitado: number; // Monto promedio solicitado
  Ticket_Promedio_Aprobado: number; // Monto promedio aprobado
  Monto_Solicitado: number; // Total solicitado en el trimestre
  Monto_Aprobado: number; // Total aprobado en el trimestre
  Tiempo_Cancelacion_Prestamo: number; // Días promedio para cancelar
}

/**
 * Engagement y actividad en la plataforma
 * Métricas de uso, actividad e inactividad
 */
export interface AppEngagement {
  Trimestre_Dias_Actividad: number; // Días activos en el trimestre (0-90)
  Trimestre_Dias_Inactividad: number; // Días inactivos en el trimestre (0-90)
  Promedio_Login_Dia: number; // Promedio de logins por día activo
  Total_Login_Dia: number; // Total de logins en el trimestre
}

/**
 * Flags de servicios utilizados
 * Booleanos que indican qué servicios activa cada empresa
 */
export interface ServicesFlags {
  Transferencias: boolean; // Uso de transferencias
  Pagos: boolean; // Pagos a través de la plataforma
  Creditos: boolean; // Solicitud y uso de créditos
  Inversiones: boolean; // Servicios de inversión
  Servicios_Utilizados: number; // Contador de servicios activos (suma de booleanos)
}

/**
 * Métricas de un trimestre específico
 * Agrupa financials, comportamiento crediticio, engagement y servicios
 */
export interface QuarterlyMetrics {
  Periodo_Fiscal: string; // Ej: "2022-Q1", "2022-Q2"
  financials: Financials;
  credit_behavior: CreditBehavior;
  app_engagement: AppEngagement;
  services_flags: ServicesFlags;
}

/**
 * Historial de evolución trimestral de la empresa
 * Array de trimestres ordenados cronológicamente
 */
export interface QuarterlyEvolution extends QuarterlyMetrics {
  // Hereda todos los campos de QuarterlyMetrics
}

/**
 * Indicador de churn (abandono)
 * Registro histórico del estado de churn de la empresa
 */
export interface ChurnStatus {
  Churn: boolean;
  Churn_Date: string | null; // ISO 8601 format o null si no hizo churn
}

/**
 * Entidad principal: Registro completo de una empresa con su historial
 * Combina perfil estático + trimestres de evolución + estado de churn
 */
export interface CompanyRecord extends StaticProfile, ChurnStatus {
  quarterly_evolution: QuarterlyMetrics[]; // Array de trimestres
}

/**
 * Formato alternativo: Vista plana del dataset
 * Cada registro representa un trimestre de una empresa
 * (Mapea directamente con el JSON tal como está estructurado)
 */
export interface FlatCompanyRecord extends Omit<StaticProfile, 'CUIT'> {
  CUIT: string | number;
  // Datos del trimestre
  Periodo_Fiscal: string;
  
  // Financials
  Ingresos: number;
  Gastos: number;
  Margen: number;
  Deuda: number;
  Activos: number;
  
  // Credit Behavior
  Prestamos_Solicitados: number;
  Prestamos_Aprobados: number;
  Prestamos_Cancelados: number;
  Prestamos_Vigentes: number;
  Ticket_Promedio_Solicitado: number;
  Ticket_Promedio_Aprobado: number;
  Monto_Solicitado: number;
  Monto_Aprobado: number;
  Tiempo_Cancelacion_Prestamo: number;
  
  // App Engagement
  Trimestre_Dias_Actividad: number;
  Trimestre_Dias_Inactividad: number;
  Promedio_Login_Dia: number;
  Total_Login_Dia: number;
  
  // Services Flags
  Transferencias: boolean;
  Pagos: boolean;
  Creditos: boolean;
  Inversiones: boolean;
  Servicios_Utilizados: number;
  
  // Churn
  Churn: boolean;
  Churn_Date: string | null;
}

/**
 * Red Flag - Indicador de riesgo identificado por el modelo
 * Puede venir como string simple o como objeto con contexto
 */
export interface RedFlag {
  flag?: string; // Nombre de la bandera (ej: "HIGH_INACTIVITY")
  description?: string; // Descripción en español
  severity?: 'critical' | 'high' | 'medium' | 'low'; // Nivel de severidad
  value?: number | string; // Valor asociado a la bandera
  // Para compatibilidad: si viene como string simple del backend
  [key: string]: any;
}

/**
 * Input para predicción - mapea los 30+ campos del modelo AI
 * Estructura completa de EmpresaInput del servicio AI Service
 */
export interface EmpresaInput {
  // Identificación
  CUIT: string | number;
  NOMBRE_EMPRESA: string;
  PERIODO_FISCAL: string; // Ej: "2024-Q4"
  
  // Estructura financiera
  EMPLEADOS?: number; // Cantidad de empleados (opcional)
  INGRESOS: number;
  GASTOS: number;
  DEUDA: number;
  ACTIVOS: number;
  MARGEN?: number; // Campo local, no se envía al AI Service
  
  // Comportamiento de crédito (9 campos)
  PRESTAMOS_SOLICITADOS: number;
  PRESTAMOS_APROBADOS: number;
  PRESTAMOS_CANCELADOS: number;
  PRESTAMOS_VIGENTES: number;
  TICKET_PROMEDIO_SOLICITADO: number;
  TICKET_PROMEDIO_APROBADO: number;
  MONTO_SOLICITADO: number;
  MONTO_APROBADO: number;
  TIEMPO_CANCELACION_PRESTAMO: number;
  
  // Transaccionalidad - IMPORTANTE: El AI Service espera estos como números (0 o 1), no booleanos
  SERVICIOS_UTILIZADOS: number;
  TRANSFERENCIAS: number; // 0 o 1
  PAGOS: number; // 0 o 1
  CREDITOS: number; // 0 o 1
  INVERSIONES: number; // 0 o 1
  
  // App Engagement (4 campos)
  TRIMESTRE_DIAS_ACTIVIDAD: number;
  TRIMESTRE_DIAS_INACTIVIDAD: number;
  PROMEDIO_LOGIN_DIA: number;
  TOTAL_LOGIN_DIA: number;
}

/**
 * Respuesta completa del servicio de predicción del AI Service
 * Incluye probabilidad, flagas de riesgo y umbral usado
 */
export interface PredictionResponse {
  // Respuesta original (para compatibilidad)
  prevision?: 'alto' | 'medio' | 'bajo';
  probabilidad?: number;
  confidence?: number;
  recomendaciones?: string[];
  
  // Nuevos campos del AI Service
  CUIT: string;
  NOMBRE_EMPRESA: string;
  churn_probability: number; // 0-1 o 0-100%
  churn_prediction: 'YES' | 'NO'; // Predicción binaria
  threshold_used: number; // Umbral de decisión usado
  red_flags: RedFlag[]; // Banderas de riesgo detalladas
  timestamp: string; // ISO 8601 format
}

/**
 * Payload para enviar al servicio de predicción
 * Estructura que el frontend envía al backend (legacy + new)
 */
export interface PredictionRequest extends EmpresaInput {
  // Hereda todos los campos de EmpresaInput
}
