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
        Soporta tanto uppercase (INGRESOS) como lowercase (ingresos)
        """
        feature_vector = []
        missing_features = []
        
        # Mapping de features UPPERCASE (API) -> lowercase (modelo entrenado)
        feature_map = {
            "INGRESOS": "ingresos",
            "GASTOS": "gastos", 
            "PRESTAMOS_SOLICITADOS": "prestamos_solicitados",
            "PRESTAMOS_APROBADOS": "prestamos_aprobados",
            "TRIMESTRE_DIAS_ACTIVIDAD": "trimestre_dias_actividad",
            # Legacy mappings para compatibilidad
            "DEUDA": "deuda_total",
            "ACTIVOS": "activos_totales",
            "PROMEDIO_LOGIN_DIA": "trimestre_logins_promedio",
            "TRANSFERENCIAS": "transferencias_trimestre",
            "PAGOS": "pagos_trimestre",
            "CREDITOS": "creditos_trimestre"
        }
        
        logger.debug(f"Features esperados por modelo: {self.features}")
        logger.debug(f"Features recibidos: {list(features.keys())}")
        
        for feature in self.features:
            # Buscar el valor: primero por nombre exact, luego por map
            value = None
            
            # Intenta primero con lowercase exacto
            if feature in features:
                value = features[feature]
            # Luego intenta con uppercase
            elif feature.upper() in features:
                value = features[feature.upper()]
            # Luego busca en el mapping
            else:
                for uppercase_key, lowercase_key in feature_map.items():
                    if lowercase_key == feature and uppercase_key in features:
                        value = features[uppercase_key]
                        break
            
            if value is not None:
                feature_vector.append(float(value))
                logger.debug(f"  {feature}: {value}")
            else:
                feature_vector.append(0.0)
                missing_features.append(feature)
                logger.warning(f"  {feature}: FALTANTE (usando 0)")
        
        if missing_features:
            logger.warning(f"Features faltantes, usando 0: {missing_features}")
        
        array = np.array(feature_vector).reshape(1, -1)
        logger.debug(f"Feature vector shape: {array.shape}, values: {array}")
        
        # Aplicar scaler si está disponible
        if self.scaler:
            array_scaled = self.scaler.transform(array)
            logger.debug(f"After scaling: {array_scaled}")
            return array_scaled
        
        return array
    
    def _get_mock_prediction(self, features: Dict[str, float]) -> float:
        """
        Genera predicción simulada basada en heurísticas mejoradas
        Detecta casos de alto riesgo correctamente
        Soporta tanto uppercase (DEUDA) como lowercase (deuda_total)
        """
        # Mapping de features para compatibilidad
        def get_feature(uppercase_name, lowercase_names, default=0):
            if uppercase_name in features:
                return features[uppercase_name]
            for lowercase_name in lowercase_names:
                if lowercase_name in features:
                    return features[lowercase_name]
            return default
        
        # Extraer features clave
        deuda = get_feature("DEUDA", ["deuda_total"], 0)
        activos = get_feature("ACTIVOS", ["activos_totales"], 1)
        ingresos = get_feature("INGRESOS", ["ingresos"], 1)
        gastos = get_feature("GASTOS", ["gastos"], 0)
        dias_actividad = get_feature("TRIMESTRE_DIAS_ACTIVIDAD", ["trimestre_dias_actividad"], 90)
        prestamos_solicitados = get_feature("PRESTAMOS_SOLICITADOS", ["prestamos_solicitados"], 0)
        prestamos_aprobados = get_feature("PRESTAMOS_APROBADOS", ["prestamos_aprobados"], 0)
        
        # ============================================================================
        # CALCULAR SCORES DE RIESGO (0-1, donde 1 = máximo riesgo)
        # ============================================================================
        
        # 1. SCORE DE DEUDA (peso: 35%)
        # Deuda muy alta = riesgo alto
        debt_to_assets = deuda / max(activos, 0.01) if activos > 0 else 0
        debt_score = min(1.0, debt_to_assets * 0.5)  # Amplificar el impacto de deuda
        
        # 2. SCORE DE INACTIVIDAD (peso: 35%)
        # Poco o nada de actividad = riesgo muy alto
        inactivity_ratio = (90 - max(0, dias_actividad)) / 90
        inactivity_score = inactivity_ratio ** 1.5  # Exponencial para penalizar más la inactividad
        
        # 3. SCORE DE RENTABILIDAD (peso: 20%)
        # Empresa con pérdidas o muy poco margen = riesgo
        if ingresos > 0:
            margin = (ingresos - gastos) / ingresos
            profitability_score = max(0, 1 - max(margin, 0))  # Si gana, score bajo; si pierde, score alto
        else:
            profitability_score = 1.0  # Sin ingresos = alto riesgo
        
        # 4. SCORE DE CRÉDITO (peso: 10%)
        # Si pidió crédito pero no se lo aprobaron, riesgo
        if prestamos_solicitados > 0:
            approval_rate = prestamos_aprobados / prestamos_solicitados
            credit_score = 1 - approval_rate  # Baja aprobación = alto riesgo
        else:
            credit_score = 0  # Sin solicitudes = sin riesgo de crédito
        
        # ============================================================================
        # COMBINAR SCORES CON PESOS
        # ============================================================================
        combined_score = (
            (debt_score * 0.35) +           # 35% - Deuda
            (inactivity_score * 0.35) +    # 35% - Inactividad
            (profitability_score * 0.20) + # 20% - Rentabilidad
            (credit_score * 0.10)          # 10% - Crédito
        )
        
        # Normalizar a [0, 1] y aplicar ajuste para sensibilidad
        probability = min(1.0, max(0.0, combined_score))
        
        # Debug logging
        logger.debug(
            f"Mock prediction components: "
            f"debt={debt_score:.3f}, inactivity={inactivity_score:.3f}, "
            f"profitability={profitability_score:.3f}, credit={credit_score:.3f} "
            f"=> combined={probability:.4f}"
        )
        
        return probability
        return probability
    
    def predict(self, features: Dict[str, float]) -> Tuple[float, str]:
        """
        Realiza predicción de churn
        Prioriza heurísticas sobre modelo entrenado si faltan features clave
        
        Retorna:
            - probability: float entre 0-1
            - risk_level: str ('bajo', 'medio', 'alto')
        """
        try:
            logger.info(f"=== PREDICT START ===")
            
            # Features clave para mock prediction
            CRITICAL_FEATURES = {
                "DEUDA": ["deuda_total", "deuda"],
                "ACTIVOS": ["activos_totales", "activos"],
                "INGRESOS": ["ingresos"],
                "GASTOS": ["gastos"],
                "TRIMESTRE_DIAS_ACTIVIDAD": ["trimestre_dias_actividad", "dias_actividad"],
            }
            
            # Contar features críticos disponibles
            available_critical = sum(
                1 for key, aliases in CRITICAL_FEATURES.items()
                if key in features or any(alias in features for alias in aliases)
            )
            
            logger.info(f"Features críticos disponibles: {available_critical}/{len(CRITICAL_FEATURES)}")
            logger.info(f"Model available: {self.model is not None}")
            
            # Decidir usar mock prediction si:
            # 1. Faltan features críticos (menos de 3 de 5)
            # 2. No hay modelo disponible
            # 3. El modelo tiene problemas (fallará gracefully)
            use_mock = available_critical < 3 or self.model is None
            
            if use_mock:
                logger.info(f"-> Usando MOCK PREDICTION (critical={available_critical}/5, model={self.model is not None})")
                probability = self._get_mock_prediction(features)
                logger.info(f"   Mock score: {probability:.4f}")
            else:
                try:
                    logger.info(f"-> Intentando usar MODELO ENTRENADO")
                    X = self._normalize_features(features)
                    probability = self.model.predict_proba(X)[0][1]
                    logger.info(f"   Model score: {probability:.4f}")
                except Exception as e:
                    logger.warning(f"   Error con modelo: {str(e)}, fallback a MOCK")
                    probability = self._get_mock_prediction(features)
                    logger.info(f"   Fallback mock score: {probability:.4f}")
            
            # Asegurar que está en [0, 1]
            probability = max(0.0, min(1.0, float(probability)))
            
            # Determinar nivel de riesgo
            if probability >= 0.7:
                risk_level = "alto"
            elif probability >= 0.4:
                risk_level = "medio"
            else:
                risk_level = "bajo"
            
            logger.info(f"Predicción: prob={probability:.4f}, riesgo={risk_level}")
            logger.info(f"=== PREDICT END ===\n")
            return probability, risk_level
            
        except Exception as e:
            logger.error(f"ERROR crítico en predicción: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            # Último recurso: usar mock prediction
            try:
                probability = self._get_mock_prediction(features)
                if probability >= 0.7:
                    risk_level = "alto"
                elif probability >= 0.4:
                    risk_level = "medio"
                else:
                    risk_level = "bajo"
                return probability, risk_level
            except:
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
