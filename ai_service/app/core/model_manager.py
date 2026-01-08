import joblib
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from config.settings import settings
from pathlib import Path

logger = logging.getLogger(__name__)


class ChurnModel:
    """
    Gestor del modelo de predicción de Churn
    Carga el modelo entrenado y proporciona métodos de predicción
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.features = settings.required_features
        self.threshold = settings.model_threshold
        self._load_model()
    
    def _load_model(self) -> bool:
        """Carga el modelo ML desde disco"""
        try:
            model_file = Path(settings.model_path)
            scaler_file = Path(settings.scaler_path)
            
            if not model_file.exists():
                logger.warning(f"Archivo de modelo no encontrado: {settings.model_path}")
                logger.warning("Usando modelo simulado (mock model)")
                self.model = None  # Usar mock model
            else:
                self.model = joblib.load(model_file)
                logger.info(f"✅ Modelo cargado: {settings.model_path}")
            
            if scaler_file.exists():
                self.scaler = joblib.load(scaler_file)
                logger.info(f"✅ Scaler cargado: {settings.scaler_path}")
            else:
                logger.warning("Scaler no encontrado, usando escalado manual")
                self.scaler = None
            
            return True
            
        except Exception as e:
            logger.error(f"Error cargando modelo: {str(e)}")
            return False
    
    def _normalize_features(self, features: Dict[str, float]) -> np.ndarray:
        """
        Normaliza features para predicción
        Convierte diccionario a numpy array en orden correcto
        """
        feature_vector = []
        missing_features = []
        
        for feature in self.features:
            if feature in features:
                feature_vector.append(features[feature])
            else:
                # Si falta una feature, usar 0 como placeholder
                feature_vector.append(0.0)
                missing_features.append(feature)
        
        if missing_features:
            logger.warning(f"Features faltantes, usando 0: {missing_features}")
        
        array = np.array(feature_vector).reshape(1, -1)
        
        # Aplicar scaler si está disponible
        if self.scaler:
            array = self.scaler.transform(array)
        
        return array
    
    def _get_mock_prediction(self, features: Dict[str, float]) -> float:
        """
        Genera predicción simulada basada en heurísticas
        Útil cuando no hay modelo entrenado
        """
        # Score basado en razón deuda/patrimonio
        debt = features.get('deuda_total', 0)
        assets = features.get('activos_totales', 1)
        
        if assets > 0:
            debt_ratio = debt / assets
        else:
            debt_ratio = 0
        
        # Score basado en actividad
        dias_actividad = features.get('trimestre_dias_actividad', 90)
        activity_score = max(0, 1 - (dias_actividad / 90))
        
        # Score basado en ingresos
        ingresos = features.get('ingresos', 1)
        gastos = features.get('gastos', 0)
        
        if ingresos > 0:
            profitability = (ingresos - gastos) / ingresos
        else:
            profitability = 0
        
        # Combinar scores
        combined_score = (
            (debt_ratio * 0.4) +  # 40% peso a deuda
            (activity_score * 0.3) +  # 30% peso a inactividad
            (max(0, 1 - profitability) * 0.3)  # 30% peso a falta rentabilidad
        )
        
        # Normalizar a [0, 1]
        probability = min(1.0, max(0.0, combined_score))
        
        logger.debug(f"Mock prediction: debt_ratio={debt_ratio:.2f}, "
                    f"activity={activity_score:.2f}, "
                    f"profitability={profitability:.2f}, "
                    f"final={probability:.4f}")
        
        return probability
    
    def predict(self, features: Dict[str, float]) -> Tuple[float, str]:
        """
        Realiza predicción de churn
        
        Retorna:
            - probability: float entre 0-1
            - risk_level: str ('bajo', 'medio', 'alto')
        """
        try:
            # Normalizar features
            X = self._normalize_features(features)
            
            # Realizar predicción
            if self.model is not None:
                probability = self.model.predict_proba(X)[0][1]
                logger.debug(f"Predicción del modelo: {probability:.4f}")
            else:
                # Usar predicción simulada si no hay modelo
                probability = self._get_mock_prediction(features)
            
            # Asegurar que está en [0, 1]
            probability = max(0.0, min(1.0, float(probability)))
            
            # Determinar nivel de riesgo
            if probability >= 0.7:
                risk_level = "alto"
            elif probability >= 0.4:
                risk_level = "medio"
            else:
                risk_level = "bajo"
            
            logger.info(f"Predicción completada: prob={probability:.4f}, riesgo={risk_level}")
            return probability, risk_level
            
        except Exception as e:
            logger.error(f"Error en predicción: {str(e)}")
            return 0.5, "desconocido"
    
    def batch_predict(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Realiza predicciones batch para múltiples empresas
        """
        try:
            predictions = []
            
            for idx, row in data.iterrows():
                features = row.to_dict()
                prob, risk = self.predict(features)
                
                predictions.append({
                    'cuit': features.get('cuit'),
                    'probability': prob,
                    'risk_level': risk
                })
            
            return pd.DataFrame(predictions)
            
        except Exception as e:
            logger.error(f"Error en predicción batch: {str(e)}")
            return pd.DataFrame()
    
    def get_model_info(self) -> Dict[str, Any]:
        """Retorna información del modelo"""
        return {
            'model_type': type(self.model).__name__ if self.model else 'MockModel',
            'model_path': settings.model_path,
            'threshold': self.threshold,
            'features_count': len(self.features),
            'features': self.features,
            'version': '1.0.0',
            'status': 'loaded' if self.model else 'mock'
        }


# Instancia global del modelo
_churn_model = None


def get_churn_model() -> ChurnModel:
    """Dependency injection para obtener instancia del modelo"""
    global _churn_model
    if _churn_model is None:
        _churn_model = ChurnModel()
    return _churn_model
