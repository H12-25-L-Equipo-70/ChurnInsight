from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import Optional, Any, List
import logging
from datetime import datetime
import uuid
import pandas as pd

from app.schemas.prediction import (
    PredictionRequest,
    EmpresaInput,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from app.core.model_manager import get_churn_model, ChurnModel
from app.core.red_flags import RedFlagAnalyzer
from app.core.oracle_connection import get_oracle_connection, OracleConnection
from config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["Predictions"])



# ============================================================================
# ENDPOINT PRINCIPAL: POST /api/v1/predictions/predict_churn
# ============================================================================
# Integración del new_notebook.md - Endpoint mejorado con red flags

@router.post(
    "/predict_churn",
    response_model=PredictionResponse,
    summary="Predicción de churn con análisis de red flags",
    description="Realiza predicción completa de churn incluyendo cálculo de señales de alerta"
)
async def predict_churn(
    data: EmpresaInput,
    model: ChurnModel = Depends(get_churn_model)
) -> PredictionResponse:
    """
    **Endpoint: POST /api/v1/predictions/predict_churn**
    
    Endpoint principal integrado del new_notebook.md.
    Realiza predicción completa de churn con análisis de red flags.
    
    **Entrada**:
    - Datos completos de empresa (EmpresaInput con 30+ campos)
    - Incluye: financiero, transaccional, engagement
    
    **Retorna**:
    - churn_probability: Probabilidad de churn (0-1)
    - churn_prediction: 0 (no churn) o 1 (churn)
    - red_flags: Lista de señales de alerta detectadas
    - threshold_used: Umbral del modelo
    - metadata: info de predicción
    """
    
    try:
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"[{request_id}] Predicción churn para CUIT: {data.CUIT} ({data.NOMBRE_EMPRESA})")
        
        # 1. Convertir datos a diccionario para procesamiento
        empresa_dict = data.dict()
        
        # 2. Calcular red flags primero
        red_flags = RedFlagAnalyzer.calcular_red_flags(empresa_dict)
        logger.debug(f"[{request_id}] Red flags ({len(red_flags)}): {red_flags}")
        
        # 3. Realizar predicción del modelo
        # Extraer solo features necesarias para el modelo
        features = {
            'INGRESOS': data.INGRESOS,
            'GASTOS': data.GASTOS,
            'DEUDA': data.DEUDA,
            'ACTIVOS': data.ACTIVOS,
            'PRESTAMOS_SOLICITADOS': data.PRESTAMOS_SOLICITADOS,
            'PRESTAMOS_APROBADOS': data.PRESTAMOS_APROBADOS,
            'TRIMESTRE_DIAS_ACTIVIDAD': data.TRIMESTRE_DIAS_ACTIVIDAD,
            'PROMEDIO_LOGIN_DIA': data.PROMEDIO_LOGIN_DIA,
            'TRANSFERENCIAS': data.TRANSFERENCIAS,
            'PAGOS': data.PAGOS,
            'CREDITOS': data.CREDITOS,
        }
        
        # Llamar al modelo
        probability, risk_level = model.predict(features)
        
        # 4. Determinar predicción binaria usando threshold del modelo
        threshold = model.threshold if hasattr(model, 'threshold') else settings.model_threshold
        churn_prediction = 1 if probability >= threshold else 0
        
        logger.info(f"[{request_id}] Predicción: prob={probability:.4f}, prediction={churn_prediction}, "
                   f"flags={len(red_flags)}, threshold={threshold:.3f}")
        
        # 5. Crear response
        response = PredictionResponse(
            CUIT=data.CUIT,
            NOMBRE_EMPRESA=data.NOMBRE_EMPRESA,
            PERIODO_FISCAL=data.PERIODO_FISCAL,
            churn_probability=round(probability, 4),
            churn_prediction=churn_prediction,
            threshold_used=round(threshold, 3),
            red_flags=red_flags,
            confidence=0.95,
            timestamp=datetime.utcnow()
        )
        
        # 6. Registrar en Oracle si está en producción
        if settings.environment == "production":
            try:
                oracle = get_oracle_connection()
                if oracle and oracle.connect():
                    oracle.insert_prediction({
                        'CUIT': data.CUIT,
                        'NOMBRE_EMPRESA': data.NOMBRE_EMPRESA,
                        'PERIODO_FISCAL': data.PERIODO_FISCAL,
                        'CHURN_PROBABILITY': probability,
                        'CHURN_PREDICTION': churn_prediction,
                        'RED_FLAGS_COUNT': len(red_flags),
                        'RED_FLAGS_TEXT': '; '.join(red_flags) if red_flags else None,
                        'TIMESTAMP': datetime.utcnow()
                    })
                    logger.debug(f"[{request_id}] ✅ Predicción registrada en Oracle")
            except Exception as e:
                logger.warning(f"[{request_id}] ⚠️ No se registró en Oracle: {str(e)}")
        
        logger.info(f"[{request_id}] ✅ Predicción completada exitosamente")
        return response
        
    except Exception as e:
        logger.error(f"[{request_id}] ❌ Error en predict_churn: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al realizar predicción: {str(e)}"
        )


# ============================================================================
# ENDPOINT BATCH: POST /api/v1/predictions/batch_predict_churn
# ============================================================================

@router.post(
    "/batch_predict_churn",
    response_model=dict,
    summary="Predicción batch de churn",
    description="Realiza predicciones para múltiples empresas"
)
async def batch_predict_churn(
    request: BatchPredictionRequest,
    model: ChurnModel = Depends(get_churn_model)
) -> dict:
    """
    **Endpoint: POST /api/v1/predictions/batch_predict_churn**
    
    Realiza predicciones batch para múltiples empresas.
    Optimizado para análisis masivos y actualizaciones periódicas.
    
    **Entrada**:
    - companies: Lista de objetos EmpresaInput
    
    **Retorna**:
    - Resumen estadístico + lista de predicciones
    - Total procesado, conteos por riesgo, etc.
    """
    
    try:
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"[{request_id}] Batch predicción: {len(request.companies)} empresas")
        
        predictions = []
        risk_distribution = {"alto": 0, "medio": 0, "bajo": 0}
        errors = []
        
        for idx, company in enumerate(request.companies, 1):
            try:
                # Procesar cada empresa
                empresa_dict = company.dict()
                
                # Red flags
                red_flags = RedFlagAnalyzer.calcular_red_flags(empresa_dict)
                
                # Predicción
                features = {
                    'INGRESOS': company.INGRESOS,
                    'GASTOS': company.GASTOS,
                    'DEUDA': company.DEUDA,
                    'ACTIVOS': company.ACTIVOS,
                    'PRESTAMOS_SOLICITADOS': company.PRESTAMOS_SOLICITADOS,
                    'PRESTAMOS_APROBADOS': company.PRESTAMOS_APROBADOS,
                    'TRIMESTRE_DIAS_ACTIVIDAD': company.TRIMESTRE_DIAS_ACTIVIDAD,
                    'PROMEDIO_LOGIN_DIA': company.PROMEDIO_LOGIN_DIA,
                    'TRANSFERENCIAS': company.TRANSFERENCIAS,
                    'PAGOS': company.PAGOS,
                    'CREDITOS': company.CREDITOS,
                }
                
                probability, risk_level = model.predict(features)
                threshold = model.threshold if hasattr(model, 'threshold') else settings.model_threshold
                churn_prediction = 1 if probability >= threshold else 0
                risk_distribution[risk_level] += 1
                
                # Agregar a resultados
                predictions.append({
                    "CUIT": company.CUIT,
                    "NOMBRE_EMPRESA": company.NOMBRE_EMPRESA,
                    "PERIODO_FISCAL": company.PERIODO_FISCAL,
                    "churn_probability": round(probability, 4),
                    "churn_prediction": churn_prediction,
                    "red_flags_count": len(red_flags),
                    "red_flags": red_flags,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                logger.debug(f"[{request_id}] {idx}/{len(request.companies)} - {company.CUIT}: "
                            f"prob={probability:.4f}, flags={len(red_flags)}")
                
                # Registrar en Oracle si en producción
                if settings.environment == "production":
                    try:
                        oracle = get_oracle_connection()
                        if oracle and oracle.connect():
                            oracle.insert_prediction({
                                'CUIT': company.CUIT,
                                'NOMBRE_EMPRESA': company.NOMBRE_EMPRESA,
                                'PERIODO_FISCAL': company.PERIODO_FISCAL,
                                'CHURN_PROBABILITY': probability,
                                'CHURN_PREDICTION': churn_prediction,
                                'RED_FLAGS_COUNT': len(red_flags),
                                'RED_FLAGS_TEXT': '; '.join(red_flags) if red_flags else None,
                                'TIMESTAMP': datetime.utcnow()
                            })
                    except Exception as e:
                        logger.debug(f"[{request_id}] No se registró CUIT {company.CUIT} en Oracle: {str(e)}")
                
            except Exception as e:
                logger.error(f"[{request_id}] Error procesando empresa {idx}: {str(e)}")
                errors.append({
                    "empresa_index": idx,
                    "error": str(e)
                })
                continue
        
        batch_response = {
            "total_processed": len(predictions),
            "total_errors": len(errors),
            "distribution": {
                "alto_riesgo": risk_distribution["alto"],
                "medio_riesgo": risk_distribution["medio"],
                "bajo_riesgo": risk_distribution["bajo"]
            },
            "predictions": predictions,
            "errors": errors if errors else None,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"[{request_id}] ✅ Batch completado: "
                   f"{len(predictions)}/{len(request.companies)} procesadas, "
                   f"alto_riesgo={risk_distribution['alto']}")
        
        return batch_response
        
    except Exception as e:
        logger.error(f"[{request_id}] ❌ Error batch: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al realizar predicción batch: {str(e)}"
        )


# ============================================================================
# ENDPOINT LEGACY: POST /api/v1/predictions/predict (compatibilidad)
# ============================================================================

@router.post(
    "/predict",
    response_model=dict,
    summary="[LEGACY] Predicción individual",
    description="Compatibilidad con versión anterior - usa predict_churn"
)
async def predict_legacy(
    request: PredictionRequest,
    model: ChurnModel = Depends(get_churn_model)
) -> dict:
    """
    **Endpoint: POST /api/v1/predictions/predict (LEGACY)**
    
    ⚠️ DEPRECADO - Usar /predict_churn en su lugar
    
    Se mantiene para compatibilidad backwards con clientes antiguos.
    Delega a predict_churn internamente.
    """
    
    request_id = str(uuid.uuid4())[:8]
    logger.warning(f"[{request_id}] ⚠️ Endpoint /predict (legacy) usado - considerar migrar a /predict_churn")
    
    # Convertir a EmpresaInput usando método built-in
    try:
        empresa_input = request.to_empresa_input()
        
        # Llamar al endpoint nuevo
        result = await predict_churn(empresa_input, model)
        
        # Retornar en formato legacy
        return {
            "cuit": result.CUIT,
            "probability": result.churn_probability,
            "risk_level": "alto" if result.churn_prediction == 1 else "bajo",
            "timestamp": result.timestamp.isoformat(),
            "deprecated": "Use /predict_churn endpoint"
        }
    except Exception as e:
        logger.error(f"[{request_id}] Error en legacy endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
