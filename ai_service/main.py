from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
import traceback
import sys

from config.settings import settings, configure_logging
from app.routes import health, predictions

# Configurar logging
configure_logging()
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.app_name,
    description="Servicio de predicción de Churn para fintech SMEs",
    version=settings.app_version,
    openapi_url=f"{settings.api_prefix}/openapi.json",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
)

# Configurar CORS para comunicación con frontend y backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware para logging de requests/responses
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para registrar todos los requests/responses"""
    
    import uuid
    request_id = str(uuid.uuid4())[:8]
    
    logger.info(f"[{request_id}] {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        logger.info(f"[{request_id}] Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"[{request_id}] Error: {str(e)}")
        logger.error(traceback.format_exc())
        raise


# Manejador global de excepciones
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Manejador personalizado para excepciones HTTP"""
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Manejador personalizado para excepciones generales"""
    
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.debug else "An error occurred",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )


# Incluir routers
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(predictions.router, prefix=settings.api_prefix)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - información de bienvenida"""
    return {
        "message": "ChurnInsight AI Service",
        "version": settings.app_version,
        "api_version": settings.api_prefix,
        "docs": f"{settings.api_prefix}/docs",
        "health": f"{settings.api_prefix}/health/check",
        "predict": f"{settings.api_prefix}/predictions/predict"
    }


@app.get("/api/v1")
async def api_root():
    """API root endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "endpoints": {
            "docs": "/api/v1/docs",
            "health": "/api/v1/health/check",
            "model_info": "/api/v1/health/model-info",
            "predict": "/api/v1/predictions/predict",
            "batch_predict": "/api/v1/predictions/batch"
        }
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Evento al iniciar la aplicación"""
    logger.info("=" * 50)
    logger.info(f"🚀 Iniciando {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Host: {settings.host}:{settings.port}")
    logger.info(f"API Prefix: {settings.api_prefix}")
    logger.info(f"Debug: {settings.debug}")
    logger.info("=" * 50)
    
    # En desarrollo, saltamos la conexión a Oracle (será lazy)
    # En producción, se conectará cuando sea necesario
    if settings.environment == "production":
        try:
            from app.core.oracle_connection import get_oracle_connection
            oracle = get_oracle_connection()
            if oracle.connect():
                logger.info("✅ Oracle Database connection successful")
            else:
                logger.warning("⚠️ Oracle Database connection failed - using mock data")
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize Oracle: {str(e)}")
    else:
        logger.info("ℹ️ Development mode: Oracle connection deferred (lazy loading)")
    
    # Cargar modelo (con timeout)
    logger.info("Loading ML model...")
    try:
        from app.core.model_manager import get_churn_model
        model = get_churn_model()
        if model:
            info = model.get_model_info()
            logger.info(f"✅ Model loaded: {info['model_type']} (status: {info['status']})")
        else:
            logger.warning("⚠️ Model is None, using mock predictions")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}", exc_info=True)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Evento al apagar la aplicación"""
    logger.info("=" * 50)
    logger.info("🛑 Apagando aplicación")
    
    # Cerrar conexión a Oracle
    try:
        from app.core.oracle_connection import get_oracle_connection
        oracle = get_oracle_connection()
        oracle.disconnect()
        logger.info("✅ Oracle connection closed")
    except Exception as e:
        logger.error(f"Error closing Oracle: {str(e)}")
    
    logger.info("=" * 50)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
