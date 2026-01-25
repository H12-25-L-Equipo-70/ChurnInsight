import oracledb
import logging
from typing import Optional, Dict, Any
from config.settings import settings
import os

logger = logging.getLogger(__name__)


class OracleConnection:
    """
    Gestor de conexiones a Oracle Database
    Implementa singleton pattern para reutilizar conexiones
    """
    
    _instance: Optional['OracleConnection'] = None
    _connection: Optional[oracledb.Connection] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._initialized = True
            self.connection = None
    
    def connect(self) -> bool:
        """
        Establece conexión a Oracle Database
        Usa Wallet authentication para seguridad
        """
        try:
            # Configurar TNS_ADMIN para wallet
            wallet_path = os.path.abspath(settings.oracle_wallet_path)
            os.environ['TNS_ADMIN'] = wallet_path
            
            logger.info(f"Conectando a Oracle Database...")
            logger.debug(f"Wallet path: {wallet_path}")
            logger.debug(f"TNS Service: {settings.oracle_service_name}")
            
            # Crear conexión con Wallet
            self.connection = oracledb.connect(
                user=settings.oracle_user,
                password=settings.oracle_password,
                dsn=settings.oracle_service_name,
                config_dir=wallet_path,
                wallet_location=wallet_path,
                wallet_password=None  # Wallet sin contraseña
            )
            
            logger.info("✅ Conexión a Oracle exitosa")
            return True
            
        except oracledb.DatabaseError as e:
            logger.error(f"❌ Error de conexión a Oracle: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"❌ Error inesperado: {str(e)}")
            return False
    
    def disconnect(self):
        """Cierra la conexión a Oracle"""
        try:
            if self.connection:
                self.connection.close()
                logger.info("Conexión a Oracle cerrada")
        except Exception as e:
            logger.error(f"Error al cerrar conexión: {str(e)}")
    
    def get_connection(self) -> Optional[oracledb.Connection]:
        """Retorna la conexión activa"""
        if not self.connection:
            self.connect()
        return self.connection
    
    def execute_query(self, query: str, params: tuple = ()) -> list:
        """
        Ejecuta un query SELECT y retorna resultados
        """
        try:
            conn = self.get_connection()
            if not conn:
                return []
            
            cursor = conn.cursor()
            cursor.execute(query, params)
            results = cursor.fetchall()
            cursor.close()
            
            return results
        except Exception as e:
            logger.error(f"Error ejecutando query: {str(e)}")
            return []
    
    def insert_prediction(self, prediction_data: Dict[str, Any]) -> bool:
        """
        Inserta predicción en tabla PREDICCIONES de Oracle
        """
        try:
            conn = self.get_connection()
            if not conn:
                return False
            
            cursor = conn.cursor()
            
            insert_query = """
            INSERT INTO PYMERDB.PREDICCIONES 
            (CUIT, PROBABILIDAD_CHURN, NIVEL_RIESGO, FEATURES_UTILIZADAS, TIMESTAMP, MODELO_VERSION)
            VALUES (:cuit, :prob_churn, :riesgo, :features, SYSTIMESTAMP, :version)
            """
            
            cursor.execute(insert_query, {
                'cuit': prediction_data.get('cuit'),
                'prob_churn': float(prediction_data.get('probability', 0)),
                'riesgo': prediction_data.get('risk_level'),
                'features': str(prediction_data.get('features_used')),
                'version': '1.0.0'
            })
            
            conn.commit()
            cursor.close()
            logger.info(f"Predicción registrada para CUIT: {prediction_data.get('cuit')}")
            return True
            
        except Exception as e:
            logger.error(f"Error insertando predicción: {str(e)}")
            return False
    
    def get_company_data(self, cuit: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene datos de una empresa desde EMPRESAS table
        """
        try:
            query = """
            SELECT * FROM PYMERDB.EMPRESAS WHERE CUIT = :cuit
            """
            results = self.execute_query(query, (cuit,))
            
            if results:
                # Retornar como diccionario
                return {
                    'cuit': results[0][0],
                    # ... mapear otros campos según necesidad
                }
            return None
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de empresa: {str(e)}")
            return None


def get_oracle_connection() -> OracleConnection:
    """Dependency injection para obtener instancia de Oracle Connection"""
    return OracleConnection()
