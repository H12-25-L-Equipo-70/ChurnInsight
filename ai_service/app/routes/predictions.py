from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import Optional, Any
import logging
from datetime import datetime
import uuid

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from app.core.model_manager import get_churn_model, ChurnModel
from app.core.oracle_connection import get_oracle_connection, OracleConnection
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predicción individual de churn",
    description="Realiza predicción de probabilidad de churn para una empresa"
)
async def predict(
    request: PredictionRequest,
    model: ChurnModel = Depends(get_churn_model),
    db: Any = None
) -> PredictionResponse:
    """
    **Endpoint: POST /api/v1/predictions/predict**
    
    Realiza predicción individual de churn basada en datos financieros.
    
    **Parámetros**:
    - `cuit`: CUIT de la empresa
    - `ingresos`: Ingresos trimestrales
    - `gastos`: Gastos trimestrales
    - Otros campos financieros opcionales
    
    **Retorna**:
    - `probability`: Probabilidad de churn (0-1)
    - `risk_level`: Nivel de riesgo (bajo/medio/alto)
    - `timestamp`: Timestamp de la predicción
    """
    
    try:
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"[{request_id}] Predicción individual para CUIT: {request.cuit}")
        
        # Convertir request a diccionario de features
        features = request.dict()
        cuit = features.pop('cuit')
        
        # Realizar predicción
        probability, risk_level = model.predict(features)
        
        # Crear response
        response = PredictionResponse(
            cuit=cuit,
            probability=probability,
            risk_level=risk_level,
            confidence=0.95,
            timestamp=datetime.utcnow(),
            features_used=len(features)
        )
        
        # Registrar en Oracle solo en producción
        if settings.environment == "production" and db:
            try:
                db.insert_prediction({
                    'cuit': cuit,
                    'probability': probability,
                    'risk_level': risk_level,
                    'features_used': features
                })
            except Exception as e:
                logger.warning(f"[{request_id}] No se registró predicción en DB: {str(e)}")
        
        logger.info(f"[{request_id}] ✅ Predicción completada: {risk_level} ({probability:.4f})")
        return response
        
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al realizar predicción: {str(e)}"
        )


@router.post(
    "/batch",
    response_model=BatchPredictionResponse,
    summary="Predicción batch de churn",
    description="Realiza predicciones para múltiples empresas"
)
async def batch_predict(
    request: BatchPredictionRequest,
    model: ChurnModel = Depends(get_churn_model),
    db: Any = None
) -> BatchPredictionResponse:
    """
    **Endpoint: POST /api/v1/predictions/batch**
    
    Realiza predicciones para múltiples empresas en un solo request.
    Útil para análisis masivos o actualizaciones periódicas.
    
    **Parámetros**:
    - `companies`: Lista de objetos PredictionRequest
    
    **Retorna**:
    - `total_processed`: Total de empresas procesadas
    - `total_high_risk`: Empresas con riesgo alto
    - `total_medium_risk`: Empresas con riesgo medio
    - `total_low_risk`: Empresas con riesgo bajo
    - `predictions`: Lista de predicciones individuales
    """
    
    try:
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"[{request_id}] Batch predicción: {len(request.companies)} empresas")
        
        predictions = []
        risk_counts = {"alto": 0, "medio": 0, "bajo": 0}
        
        for company in request.companies:
            try:
                features = company.dict()
                cuit = features.pop('cuit')
                
                # Predicción
                probability, risk_level = model.predict(features)
                risk_counts[risk_level] += 1
                
                # Response individual
                response = PredictionResponse(
                    cuit=cuit,
                    probability=probability,
                    risk_level=risk_level,
                    confidence=0.95,
                    timestamp=datetime.utcnow(),
                    features_used=len(features)
                )
                predictions.append(response)
                
                # Registrar en DB solo en producción
                if settings.environment == "production" and db:
                    try:
                        db.insert_prediction({
                            'cuit': cuit,
                            'probability': probability,
                            'risk_level': risk_level,
                            'features_used': features
                        })
                    except Exception as e:
                        logger.warning(f"No se registró predicción para {cuit}: {str(e)}")
                    
            except Exception as e:
                logger.error(f"Error prediciendo {company.cuit}: {str(e)}")
                continue
        
        batch_response = BatchPredictionResponse(
            total_processed=len(predictions),
            total_high_risk=risk_counts["alto"],
            total_medium_risk=risk_counts["medio"],
            total_low_risk=risk_counts["bajo"],
            predictions=predictions,
            timestamp=datetime.utcnow()
        )
        
        logger.info(f"[{request_id}] ✅ Batch completado: "
                   f"{len(predictions)} predicciones, "
                   f"{risk_counts['alto']} alto riesgo")
        
        return batch_response
        
    except Exception as e:
        logger.error(f"Error en batch predicción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al realizar predicción batch: {str(e)}"
        )


@router.get(
    "/by-risk-level/{risk_level}",
    response_model=dict,
    summary="Obtener predicciones por nivel de riesgo",
    description="Retorna estadísticas de predicciones filtradas por riesgo"
)
async def get_by_risk_level(
    risk_level: str = Path(..., description="alto/medio/bajo")
) -> dict:
    """
    **Endpoint: GET /api/v1/predictions/by-risk-level/{risk_level}**
    
    Obtiene estadísticas de predicciones agrupadas por nivel de riesgo.
    
    **Parámetros**:
    - `risk_level`: alto, medio o bajo
    
    **Retorna**:
    - Estadísticas de empresas en ese nivel de riesgo
    """
    
    if risk_level not in ["alto", "medio", "bajo"]:
        raise HTTPException(
            status_code=400,
            detail="risk_level debe ser: alto, medio o bajo"
        )
    
    logger.info(f"Consultando predicciones de riesgo {risk_level}")
    
    return {
        "risk_level": risk_level,
        "message": f"Endpoint para obtener predicciones de riesgo {risk_level}",
        "note": "Conectar a Oracle para obtener datos reales"
    }
