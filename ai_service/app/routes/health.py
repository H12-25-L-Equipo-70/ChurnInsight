from fastapi import APIRouter, Depends
from datetime import datetime
import logging

from app.schemas.prediction import HealthResponse, ModelInfoResponse
from app.core.model_manager import get_churn_model, ChurnModel
from app.core.oracle_connection import get_oracle_connection, OracleConnection
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["Health & Info"])


@router.get(
    "/check",
    response_model=HealthResponse,
    summary="Health check de la aplicación",
    description="Verifica el estado de la aplicación y dependencias"
)
async def health_check(
    model: ChurnModel = Depends(get_churn_model)
) -> HealthResponse:
    """
    **Endpoint: GET /api/v1/health/check**
    
    Verifica que todos los componentes estén funcionales:
    - Servicio FastAPI
    - Modelo ML cargado
    - Conexión a Oracle Database (en producción)
    
    **Retorna**:
    - `status`: healthy/degraded/unhealthy
    - `model_loaded`: boolean
    - `database_connected`: boolean
    """
    
    # Verificar modelo
    model_loaded = model.model is not None or "mock" in str(model.get_model_info()['status'])
    
    # Verificar base de datos (solo en producción)
    database_connected = False
    if settings.environment == "production":
        try:
            from app.core.oracle_connection import get_oracle_connection
            db = get_oracle_connection()
            db_conn = db.get_connection()
            database_connected = db_conn is not None
        except Exception as e:
            logger.debug(f"Database check skipped: {str(e)}")
            database_connected = False
    else:
        # En desarrollo, no conectamos a BD
        database_connected = None  # None significa "no verificado"
    
    # Determinar status
    if model_loaded:
        if settings.environment == "production":
            status = "healthy" if database_connected else "degraded"
        else:
            status = "healthy"  # En desarrollo, solo necesitamos el modelo
    else:
        status = "unhealthy"
    
    response = HealthResponse(
        status=status,
        version="1.0.0",
        environment=settings.environment,
        model_loaded=model_loaded,
        database_connected=database_connected,
        timestamp=datetime.utcnow()
    )
    
    logger.info(f"Health check: {status}")
    return response


@router.get(
    "/",
    response_model=dict,
    summary="Status de la API",
    description="Información básica de la API"
)
async def root_health() -> dict:
    """
    **Endpoint: GET /api/v1/health/**
    
    Retorna información básica de la API
    """
    
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "environment": settings.environment,
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/api/v1/health/check",
            "model_info": "/api/v1/health/model-info",
            "predict": "/api/v1/predictions/predict",
            "batch": "/api/v1/predictions/batch",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Información del modelo ML",
    description="Detalles técnicos del modelo de predicción"
)
async def model_info(
    model: ChurnModel = Depends(get_churn_model)
) -> ModelInfoResponse:
    """
    **Endpoint: GET /api/v1/health/model-info**
    
    Retorna información detallada sobre el modelo ML:
    - Tipo de modelo
    - Features utilizadas
    - Threshold de predicción
    - Estado de carga
    
    **Retorna**:
    - ModelInfoResponse con detalles técnicos
    """
    
    return ModelInfoResponse(**model.get_model_info())


@router.get(
    "/ready",
    response_model=dict,
    summary="Readiness check",
    description="Verifica si la aplicación está lista para recibir tráfico"
)
async def readiness_check(
    model: ChurnModel = Depends(get_churn_model),
    db: OracleConnection = Depends(get_oracle_connection)
) -> dict:
    """
    **Endpoint: GET /api/v1/health/ready**
    
    Para uso en Kubernetes/Docker:
    - 200 OK si la app está lista para tráfico
    - 503 Service Unavailable si no está lista
    """
    
    model_loaded = model.model is not None
    
    try:
        db_conn = db.get_connection()
        database_ready = db_conn is not None
    except:
        database_ready = False
    
    if model_loaded and database_ready:
        return {
            "ready": True,
            "message": "Application is ready to receive traffic"
        }
    else:
        return {
            "ready": False,
            "message": "Application is not ready",
            "details": {
                "model_loaded": model_loaded,
                "database_connected": database_ready
            }
        }


@router.get(
    "/live",
    response_model=dict,
    summary="Liveness check",
    description="Verifica si la aplicación está viva"
)
async def liveness_check() -> dict:
    """
    **Endpoint: GET /api/v1/health/live**
    
    Para uso en Kubernetes/Docker:
    - 200 OK si la aplicación está funcionando
    - 503 Service Unavailable si está caída
    """
    
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }
