import os
import logging
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

logger = logging.getLogger(__name__)

# Get absolute path to ai_service directory
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """
    Configuración de la aplicación FastAPI
    Carga variables de entorno desde .env
    """
    
    # Información de la app
    app_name: str = "ChurnInsight AI Service"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # API Configuration
    api_prefix: str = "/api/v1"
    debug: bool = environment == "development"
    
    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    
    # Oracle Database Configuration
    oracle_host: str = os.getenv("ORACLE_HOST", "pymerdb.sa-saopaulo-1.oraclecloud.com")
    oracle_port: int = int(os.getenv("ORACLE_PORT", 1522))
    oracle_service_name: str = os.getenv("ORACLE_SERVICE_NAME", "pymerdb_high")
    oracle_user: str = os.getenv("ORACLE_USER", "pymerdb")
    oracle_password: str = os.getenv("ORACLE_PASSWORD", "")
    oracle_wallet_path: str = os.getenv("ORACLE_WALLET_PATH", "../backend/wallet_pymer")
    
    # ML Model Configuration - Using absolute paths
    model_path: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "churn_model.pkl"))
    scaler_path: str = os.getenv("SCALER_PATH", str(BASE_DIR / "models" / "scaler.pkl"))
    
    # Logging Configuration - Using absolute paths
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: str = os.getenv("LOG_FILE", str(BASE_DIR / "logs" / "ai_service.log"))
    
    # Model Configuration
    model_threshold: float = float(os.getenv("MODEL_THRESHOLD", 0.5))
    batch_size: int = int(os.getenv("BATCH_SIZE", 32))
    
    # Feature Engineering
    # IMPORTANTE: Estos features deben coincidir exactamente con los features del modelo entrenado
    # Si cambias aquí, debes reentrenar el modelo
    required_features: list = [
        "ingresos",
        "gastos",
        "deuda",
        "activos",
        "prestamos_solicitados",
        "prestamos_aprobados",
        "trimestre_dias_actividad",
        "promedio_login_dia",
        "transferencias",
        "pagos",
        "creditos"
    ]
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False


settings = Settings()


def configure_logging():
    """Configura logging para la aplicación"""
    
    # Crear directorio de logs si no existe
    Path(settings.log_file).parent.mkdir(parents=True, exist_ok=True)
    
    # Formato de logs
    log_format = (
        '%(asctime)s - %(name)s - %(levelname)s - '
        '[%(filename)s:%(lineno)d] - %(message)s'
    )
    
    # Configurar logging
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format=log_format,
        handlers=[
            logging.FileHandler(settings.log_file),
            logging.StreamHandler()
        ]
    )
    
    logger.info(f"ChurnInsight AI Service v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
