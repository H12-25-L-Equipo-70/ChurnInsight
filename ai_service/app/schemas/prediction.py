from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class EmpresaInput(BaseModel):
    """Schema de entrada para predicción de churn - Integrado desde new_notebook.md"""
    
    # Identificación
    CUIT: str = Field(..., description="CUIT de la empresa", min_length=10, max_length=13)
    NOMBRE_EMPRESA: str = Field(..., description="Nombre de la empresa", min_length=1, max_length=255)
    PERIODO_FISCAL: str = Field(..., description="Período fiscal (ej: 2024-Q4)", min_length=7, max_length=10)
    
    # Estructura financiera
    EMPLEADOS: int = Field(default=0, description="Cantidad de empleados", ge=0)
    INGRESOS: float = Field(..., description="Ingresos trimestrales", ge=0)
    GASTOS: float = Field(..., description="Gastos trimestrales", ge=0)
    DEUDA: float = Field(..., description="Deuda total", ge=0)
    ACTIVOS: float = Field(..., description="Activos totales", ge=0)
    
    # Comportamiento de crédito
    PRESTAMOS_SOLICITADOS: int = Field(default=0, description="Préstamos solicitados", ge=0)
    PRESTAMOS_APROBADOS: int = Field(default=0, description="Préstamos aprobados", ge=0)
    MONTO_SOLICITADO: float = Field(default=0.0, description="Monto total solicitado", ge=0)
    MONTO_APROBADO: float = Field(default=0.0, description="Monto total aprobado", ge=0)
    TICKET_PROMEDIO_SOLICITADO: float = Field(default=0.0, description="Ticket promedio solicitado", ge=0)
    TICKET_PROMEDIO_APROBADO: float = Field(default=0.0, description="Ticket promedio aprobado", ge=0)
    
    # Gestión de crédito
    PRESTAMOS_CANCELADOS: int = Field(default=0, description="Préstamos cancelados", ge=0)
    PRESTAMOS_VIGENTES: int = Field(default=0, description="Préstamos vigentes", ge=0)
    TIEMPO_CANCELACION_PRESTAMO: int = Field(default=0, description="Días promedio para cancelar", ge=0)
    
    # Transaccionalidad
    SERVICIOS_UTILIZADOS: int = Field(default=0, description="Cantidad de servicios activos", ge=0)
    TRANSFERENCIAS: int = Field(default=0, description="Transferencias realizadas (trimestre)", ge=0)
    PAGOS: int = Field(default=0, description="Pagos realizados (trimestre)", ge=0)
    CREDITOS: int = Field(default=0, description="Créditos (trimestre)", ge=0)
    INVERSIONES: int = Field(default=0, description="Inversiones (trimestre)", ge=0)
    
    # Engagement (actividad)
    TRIMESTRE_DIAS_ACTIVIDAD: int = Field(default=90, description="Días activos en trimestre", ge=0, le=90)
    TRIMESTRE_DIAS_INACTIVIDAD: int = Field(default=0, description="Días inactivos en trimestre", ge=0, le=90)
    PROMEDIO_LOGIN_DIA: float = Field(default=0.0, description="Logins promedio por día", ge=0)
    TOTAL_LOGIN_DIA: int = Field(default=0, description="Total de logins en trimestre", ge=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "CUIT": "20748123114",
                "NOMBRE_EMPRESA": "TechStart SRL",
                "PERIODO_FISCAL": "2024-Q4",
                "EMPLEADOS": 15,
                "INGRESOS": 1500000.00,
                "GASTOS": 1000000.00,
                "DEUDA": 500000.00,
                "ACTIVOS": 2000000.00,
                "PRESTAMOS_SOLICITADOS": 3,
                "PRESTAMOS_APROBADOS": 2,
                "MONTO_SOLICITADO": 300000.00,
                "MONTO_APROBADO": 200000.00,
                "TICKET_PROMEDIO_SOLICITADO": 100000.00,
                "TICKET_PROMEDIO_APROBADO": 100000.00,
                "PRESTAMOS_CANCELADOS": 1,
                "PRESTAMOS_VIGENTES": 1,
                "TIEMPO_CANCELACION_PRESTAMO": 45,
                "SERVICIOS_UTILIZADOS": 5,
                "TRANSFERENCIAS": 45,
                "PAGOS": 30,
                "CREDITOS": 15,
                "INVERSIONES": 5,
                "TRIMESTRE_DIAS_ACTIVIDAD": 85,
                "TRIMESTRE_DIAS_INACTIVIDAD": 5,
                "PROMEDIO_LOGIN_DIA": 3.5,
                "TOTAL_LOGIN_DIA": 255
            }
        }


# Alias para compatibilidad backwards
class PredictionRequest(BaseModel):
    """Schema flexible para endpoint legacy - acepta lowercase y UPPERCASE"""
    
    # Campos flexible
    cuit: Optional[str] = Field(None, description="CUIT de la empresa")
    CUIT: Optional[str] = Field(None, description="CUIT alternativo (UPPERCASE)")
    ingresos: Optional[float] = Field(None, description="Ingresos")
    INGRESOS: Optional[float] = Field(None)
    gastos: Optional[float] = Field(None, description="Gastos")
    GASTOS: Optional[float] = Field(None)
    margen_operativo: Optional[float] = Field(None)
    deuda_total: Optional[float] = Field(None, description="Deuda total")
    DEUDA: Optional[float] = Field(None)
    activos_totales: Optional[float] = Field(None, description="Activos totales")
    ACTIVOS: Optional[float] = Field(None)
    prestamos_solicitados: Optional[int] = Field(0, description="Préstamos solicitados")
    PRESTAMOS_SOLICITADOS: Optional[int] = Field(None)
    prestamos_aprobados: Optional[int] = Field(0, description="Préstamos aprobados")
    PRESTAMOS_APROBADOS: Optional[int] = Field(None)
    trimestre_dias_actividad: Optional[int] = Field(90, description="Días activos")
    TRIMESTRE_DIAS_ACTIVIDAD: Optional[int] = Field(None)
    trimestre_logins_promedio: Optional[float] = Field(0, description="Logins promedio")
    PROMEDIO_LOGIN_DIA: Optional[float] = Field(None)
    transferencias_trimestre: Optional[int] = Field(0, description="Transferencias")
    TRANSFERENCIAS: Optional[int] = Field(None)
    pagos_trimestre: Optional[int] = Field(0, description="Pagos")
    PAGOS: Optional[int] = Field(None)
    creditos_trimestre: Optional[int] = Field(0, description="Créditos")
    CREDITOS: Optional[int] = Field(None)
    
    class Config:
        populate_by_name = True
    
    def to_empresa_input(self) -> EmpresaInput:
        """Convertir a formato EmpresaInput"""
        return EmpresaInput(
            CUIT=self.CUIT or self.cuit or "00000000000",
            NOMBRE_EMPRESA="AUTO-GENERATED",
            PERIODO_FISCAL="2024-Q4",
            EMPLEADOS=0,
            INGRESOS=self.INGRESOS or self.ingresos or 0,
            GASTOS=self.GASTOS or self.gastos or 0,
            DEUDA=self.DEUDA or self.deuda_total or 0,
            ACTIVOS=self.ACTIVOS or self.activos_totales or 0,
            PRESTAMOS_SOLICITADOS=self.PRESTAMOS_SOLICITADOS or self.prestamos_solicitados or 0,
            PRESTAMOS_APROBADOS=self.PRESTAMOS_APROBADOS or self.prestamos_aprobados or 0,
            MONTO_SOLICITADO=0,
            MONTO_APROBADO=0,
            PRESTAMOS_CANCELADOS=0,
            PRESTAMOS_VIGENTES=0,
            TIEMPO_CANCELACION_PRESTAMO=0,
            SERVICIOS_UTILIZADOS=0,
            TRANSFERENCIAS=self.TRANSFERENCIAS or self.transferencias_trimestre or 0,
            PAGOS=self.PAGOS or self.pagos_trimestre or 0,
            CREDITOS=self.CREDITOS or self.creditos_trimestre or 0,
            INVERSIONES=0,
            TRIMESTRE_DIAS_ACTIVIDAD=self.TRIMESTRE_DIAS_ACTIVIDAD or self.trimestre_dias_actividad or 90,
            TRIMESTRE_DIAS_INACTIVIDAD=0,
            PROMEDIO_LOGIN_DIA=self.PROMEDIO_LOGIN_DIA or self.trimestre_logins_promedio or 0,
            TOTAL_LOGIN_DIA=0,
        )
class PredictionRequest(EmpresaInput):
    """Alias para compatibilidad con código existente"""
    pass


class PredictionResponse(BaseModel):
    """Response de predicción de churn con red flags"""
    
    CUIT: str = Field(..., description="CUIT de la empresa")
    NOMBRE_EMPRESA: str = Field(..., description="Nombre de la empresa")
    PERIODO_FISCAL: str = Field(..., description="Período fiscal")
    churn_probability: float = Field(..., description="Probabilidad de churn (0-1)", ge=0, le=1)
    churn_prediction: int = Field(..., description="Predicción binaria: 0=no churn, 1=churn", ge=0, le=1)
    threshold_used: float = Field(..., description="Umbral utilizado para la predicción", ge=0, le=1)
    red_flags: List[str] = Field(default_factory=list, description="Lista de señales de alerta identificadas")
    confidence: float = Field(default=0.95, description="Confianza del modelo")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "CUIT": "20748123114",
                "NOMBRE_EMPRESA": "TechStart SRL",
                "PERIODO_FISCAL": "2024-Q4",
                "churn_probability": 0.23,
                "churn_prediction": 0,
                "threshold_used": 0.5,
                "red_flags": [],
                "confidence": 0.95,
                "timestamp": "2024-01-07T10:30:00Z"
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request para predicción batch"""
    
    companies: List[PredictionRequest] = Field(..., description="Lista de empresas para predecir")
    
    class Config:
        json_schema_extra = {
            "example": {
                "companies": [
                    {
                        "cuit": "20748123114",
                        "ingresos": 1500000.00,
                        "gastos": 1000000.00,
                        "margen_operativo": 33.33,
                        "deuda_total": 500000.00,
                        "activos_totales": 2000000.00,
                        "prestamos_solicitados": 3,
                        "prestamos_aprobados": 2,
                        "trimestre_dias_actividad": 85,
                        "trimestre_logins_promedio": 12.5,
                        "transferencias_trimestre": 45,
                        "pagos_trimestre": 30,
                        "creditos_trimestre": 15
                    }
                ]
            }
        }


class BatchPredictionResponse(BaseModel):
    """Response de predicción batch"""
    
    total_processed: int
    total_high_risk: int
    total_medium_risk: int
    total_low_risk: int
    predictions: List[PredictionResponse]
    timestamp: datetime


class HealthResponse(BaseModel):
    """Response de health check"""
    
    status: str
    version: str
    environment: str
    model_loaded: bool
    database_connected: Optional[bool]
    timestamp: datetime


class ModelInfoResponse(BaseModel):
    """Información del modelo ML"""
    
    model_type: str
    model_path: str
    threshold: float
    features_count: int
    features: List[str]
    version: str
    status: str


class ErrorResponse(BaseModel):
    """Response de error estándar"""
    
    error: str
    detail: str
    timestamp: datetime
    request_id: Optional[str] = None


class StatisticsResponse(BaseModel):
    """Estadísticas de predicciones"""
    
    total_predictions: int
    average_probability: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    churn_rate: float
    timestamp: datetime


class TrainingMetricsRequest(BaseModel):
    """Request para obtener métricas del modelo"""
    
    metric_type: str = Field(default="summary", description="Tipo de métrica")
    period: Optional[str] = Field(default=None, description="Período para análisis")


class TrainingMetricsResponse(BaseModel):
    """Métricas del modelo entrenado"""
    
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    auc: Optional[float] = None
    training_date: Optional[datetime] = None
    training_samples: Optional[int] = None
    feature_importance: Optional[Dict[str, float]] = None
