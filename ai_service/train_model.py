"""
Script para entrenar el modelo de predicción de churn
Utiliza el dataset de empresas fintech
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)
import joblib
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rutas
DATA_PATH = "./data/dataset_empresas_fintech_v2.7.csv"
MODEL_PATH = "./models/churn_model.pkl"
SCALER_PATH = "./models/scaler.pkl"


def load_and_prepare_data(csv_path: str) -> tuple:
    """Carga y prepara el dataset para entrenamiento"""
    
    logger.info(f"Cargando datos desde {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Dataset cargado: {df.shape[0]} filas, {df.shape[1]} columnas")
        
        # Features para el modelo
        feature_columns = [
            'ingresos', 'gastos', 'margen_operativo', 'deuda_total',
            'activos_totales', 'prestamos_solicitados', 'prestamos_aprobados',
            'trimestre_dias_actividad', 'trimestre_logins_promedio',
            'transferencias_trimestre', 'pagos_trimestre', 'creditos_trimestre'
        ]
        
        # Target variable
        target_column = 'churn'  # O el nombre real en el dataset
        
        # Seleccionar columnas disponibles
        available_features = [col for col in feature_columns if col in df.columns]
        logger.info(f"Features disponibles: {available_features}")
        
        # Manejar valores faltantes
        df = df[available_features + [target_column]].dropna()
        logger.info(f"Después de limpiar: {df.shape[0]} filas")
        
        X = df[available_features]
        y = df[target_column]
        
        return X, y, available_features
        
    except FileNotFoundError:
        logger.error(f"Archivo no encontrado: {csv_path}")
        logger.info("Creando dataset de demostración...")
        return create_dummy_data()
    except Exception as e:
        logger.error(f"Error cargando datos: {str(e)}")
        return create_dummy_data()


def create_dummy_data() -> tuple:
    """Crea dataset dummy para demostración"""
    
    logger.warning("Usando dataset dummy para entrenamiento de prueba")
    
    np.random.seed(42)
    n_samples = 200
    
    feature_columns = [
        'ingresos', 'gastos', 'margen_operativo', 'deuda_total',
        'activos_totales', 'prestamos_solicitados', 'prestamos_aprobados',
        'trimestre_dias_actividad', 'trimestre_logins_promedio',
        'transferencias_trimestre', 'pagos_trimestre', 'creditos_trimestre'
    ]
    
    data = {
        'ingresos': np.random.uniform(100000, 5000000, n_samples),
        'gastos': np.random.uniform(50000, 3000000, n_samples),
        'margen_operativo': np.random.uniform(-20, 50, n_samples),
        'deuda_total': np.random.uniform(0, 2000000, n_samples),
        'activos_totales': np.random.uniform(100000, 5000000, n_samples),
        'prestamos_solicitados': np.random.randint(0, 10, n_samples),
        'prestamos_aprobados': np.random.randint(0, 8, n_samples),
        'trimestre_dias_actividad': np.random.randint(0, 91, n_samples),
        'trimestre_logins_promedio': np.random.uniform(0, 30, n_samples),
        'transferencias_trimestre': np.random.randint(0, 100, n_samples),
        'pagos_trimestre': np.random.randint(0, 80, n_samples),
        'creditos_trimestre': np.random.randint(0, 50, n_samples),
    }
    
    X = pd.DataFrame(data)
    
    # Crear target basado en heurística
    y = (
        (X['deuda_total'] / (X['activos_totales'] + 1) > 0.5).astype(int) |
        (X['trimestre_dias_actividad'] < 30).astype(int) |
        ((X['ingresos'] - X['gastos']) < 0).astype(int)
    ).astype(int)
    
    logger.info(f"Dataset dummy creado: {X.shape[0]} muestras")
    logger.info(f"Churn distribution: {y.value_counts().to_dict()}")
    
    return X, y, feature_columns


def train_model(X, y, features):
    """Entrena el modelo Random Forest"""
    
    logger.info("Dividiendo datos en train/test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    logger.info(f"Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")
    logger.info(f"Churn rate train: {y_train.mean():.2%}")
    logger.info(f"Churn rate test: {y_test.mean():.2%}")
    
    # Escalar features
    logger.info("Escalando features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Entrenar modelo
    logger.info("Entrenando Random Forest...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Importante para dataset desbalanceado
    )
    
    model.fit(X_train_scaled, y_train)
    logger.info("✅ Modelo entrenado")
    
    # Evaluar
    logger.info("Evaluando modelo...")
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    logger.info(f"\n{'=' * 50}")
    logger.info("MÉTRICAS DEL MODELO")
    logger.info(f"{'=' * 50}")
    logger.info(f"Accuracy:  {accuracy:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall:    {recall:.4f}")
    logger.info(f"F1-Score:  {f1:.4f}")
    logger.info(f"AUC:       {auc:.4f}")
    logger.info(f"{'=' * 50}\n")
    
    logger.info("Matriz de confusión:")
    logger.info(confusion_matrix(y_test, y_pred))
    
    logger.info("\nReporte de clasificación:")
    logger.info(classification_report(y_test, y_pred))
    
    # Feature importance
    logger.info("\nFeature Importance:")
    importances = model.feature_importances_
    for feature, importance in sorted(zip(features, importances), 
                                     key=lambda x: x[1], reverse=True):
        logger.info(f"  {feature}: {importance:.4f}")
    
    return model, scaler, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'auc': auc,
        'training_samples': len(X_train)
    }


def save_artifacts(model, scaler):
    """Guarda el modelo y scaler en disco"""
    
    logger.info("Guardando artefactos...")
    
    # Crear directorio si no existe
    Path("./models").mkdir(exist_ok=True)
    
    joblib.dump(model, MODEL_PATH)
    logger.info(f"✅ Modelo guardado: {MODEL_PATH}")
    
    joblib.dump(scaler, SCALER_PATH)
    logger.info(f"✅ Scaler guardado: {SCALER_PATH}")


def main():
    """Función principal"""
    
    logger.info("=" * 50)
    logger.info("ENTRENAMIENTO DE MODELO DE CHURN")
    logger.info("=" * 50 + "\n")
    
    # Cargar datos
    X, y, features = load_and_prepare_data(DATA_PATH)
    
    # Entrenar modelo
    model, scaler, metrics = train_model(X, y, features)
    
    # Guardar artefactos
    save_artifacts(model, scaler)
    
    logger.info("\n" + "=" * 50)
    logger.info("✅ ENTRENAMIENTO COMPLETADO")
    logger.info("=" * 50)
    
    return model, scaler, metrics


if __name__ == "__main__":
    main()
