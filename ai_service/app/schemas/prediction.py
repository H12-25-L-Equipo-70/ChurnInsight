from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class PredictionRequest(BaseModel):
    """Request para predicción de churn"""
    
    cuit: str = Field(..., description="CUIT de la empresa")
    ingresos: float = Field(..., description="Ingresos trimestrales")
    gastos: float = Field(..., description="Gastos trimestrales")
    margen_operativo: float = Field(default=0.0, description="Margen operativo (%)")
    deuda_total: float = Field(default=0.0, description="Deuda total")
    activos_totales: float = Field(default=0.0, description="Activos totales")
    prestamos_solicitados: int = Field(default=0, description="Préstamos solicitados")
    prestamos_aprobados: int = Field(default=0, description="Préstamos aprobados")
    trimestre_dias_actividad: int = Field(default=90, description="Días activos este trimestre")
    trimestre_logins_promedio: float = Field(default=0.0, description="Logins promedio")
    transferencias_trimestre: int = Field(default=0, description="Transferencias")
    pagos_trimestre: int = Field(default=0, description="Pagos")
    creditos_trimestre: int = Field(default=0, description="Créditos")
    
    class Config:
        json_schema_extra = {
            "example": {
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
        }


class PredictionResponse(BaseModel):
    """Response de predicción de churn"""
    
    cuit: str
    probability: float = Field(..., description="Probabilidad de churn (0-1)")
    risk_level: str = Field(..., description="Nivel de riesgo: bajo/medio/alto")
    confidence: float = Field(default=0.95, description="Confianza del modelo")
    timestamp: datetime
    features_used: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "cuit": "20748123114",
                "probability": 0.23,
                "risk_level": "bajo",
                "confidence": 0.95,
                "timestamp": "2024-01-07T10:30:00Z",
                "features_used": 13
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
