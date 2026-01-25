"""
Módulo para cálculo de red flags (señales de alerta) en predicción de churn
Integrado del new_notebook.md para análisis de riesgos
"""

import pandas as pd
import logging
from typing import List

logger = logging.getLogger(__name__)


class RedFlagAnalyzer:
    """
    Analiza datos de empresa y genera red flags basadas en heurísticas
    de riesgo de churn
    """
    
    @staticmethod
    def calcular_red_flags(data: dict) -> List[dict]:
        """
        Calcula red flags (senales de alerta) basadas en datos de empresa
        Retorna objetos con flag, descripcion y severidad (critical/high/medium/low)
        Ordenados de mayor a menor severidad
        
        Args:
            data: Diccionario con campos de empresa (puede estar en uppercase o lowercase)
        
        Returns:
            Lista de diccionarios con flags, descripciones y severidad
        """
        flags = []
        
        # Normalizar keys a uppercase (compatibilidad con EmpresaInput)
        data_upper = {k.upper(): v for k, v in data.items()}
        
        try:
            # === CRITICAL FLAGS (Riesgo inmediato de abandono) ===
            
            dias_actividad = data_upper.get('TRIMESTRE_DIAS_ACTIVIDAD', 90)
            ingresos = data_upper.get('INGRESOS', 0)
            gastos = data_upper.get('GASTOS', 0)
            deuda = data_upper.get('DEUDA', 0)
            activos = data_upper.get('ACTIVOS', 1)
            
            # CRITICAL 1: Inactividad extrema
            if dias_actividad == 0:
                flags.append({
                    "flag": "COMPLETE_INACTIVITY",
                    "description": "Empresa completamente inactiva en el trimestre",
                    "severity": "critical"
                })
            
            # CRITICAL 2: Sin movimiento transaccional
            transferencias = data_upper.get('TRANSFERENCIAS', 0)
            pagos = data_upper.get('PAGOS', 0)
            creditos = data_upper.get('CREDITOS', 0)
            total_ops = transferencias + pagos
            
            if total_ops == 0 and creditos == 0:
                flags.append({
                    "flag": "NO_TRANSACTIONS",
                    "description": "Sin movimiento transaccional: empresa no opera",
                    "severity": "critical"
                })
            
            # CRITICAL 3: Margen negativo (perdidas)
            margen = ingresos - gastos
            if margen < 0:
                flags.append({
                    "flag": "NEGATIVE_MARGIN",
                    "description": "Margen negativo: empresa opera con perdidas",
                    "severity": "critical"
                })
            
            # === HIGH SEVERITY FLAGS (Riesgo significativo) ===
            
            # HIGH 1: Alto endeudamiento
            ratio_deuda = deuda / activos if activos > 0 else 0
            if ratio_deuda > 0.7:
                flags.append({
                    "flag": "HIGH_DEBT",
                    "description": "Ratio deuda/activos muy alto (>70%): sobreendeudamiento",
                    "severity": "high"
                })
            
            # HIGH 2: Solicitudes sin aprobacion
            prestamos_solicitados = data_upper.get('PRESTAMOS_SOLICITADOS', 0)
            prestamos_aprobados = data_upper.get('PRESTAMOS_APROBADOS', 0)
            
            if prestamos_solicitados > 0 and prestamos_aprobados == 0:
                flags.append({
                    "flag": "NO_APPROVAL",
                    "description": "Solicitudes de credito rechazadas: sin aprobacion",
                    "severity": "high"
                })
            
            # HIGH 3: Inactividad severa (>50%)
            dias_inactividad = data_upper.get('TRIMESTRE_DIAS_INACTIVIDAD', 0)
            total_dias = dias_actividad + dias_inactividad
            if total_dias > 0:
                ratio_inactividad = dias_inactividad / total_dias
                if ratio_inactividad > 0.5 and dias_actividad > 0:
                    flags.append({
                        "flag": "HIGH_INACTIVITY",
                        "description": "Inactividad severa: dias activos por debajo de esperado",
                        "severity": "high"
                    })
            
            # HIGH 4: Baja tasa de aprobacion de prestamos
            monto_solicitado = data_upper.get('MONTO_SOLICITADO', 0)
            monto_aprobado = data_upper.get('MONTO_APROBADO', 0)
            
            if monto_solicitado > 0:
                ratio_aprobacion = monto_aprobado / monto_solicitado
                if ratio_aprobacion < 0.3:
                    flags.append({
                        "flag": "LOW_APPROVAL_RATE",
                        "description": "Tasa de aprobacion muy baja (<30%): riesgo crediticio",
                        "severity": "high"
                    })
            
            # === MEDIUM SEVERITY FLAGS (Advertencia moderada) ===
            
            # MEDIUM 1: Rentabilidad muy baja
            if ingresos > 0:
                rentabilidad = margen / ingresos
                if rentabilidad < 0.1 and margen > 0:
                    flags.append({
                        "flag": "LOW_PROFITABILITY",
                        "description": "Rentabilidad muy baja (<10%): margenes muy estrechos",
                        "severity": "medium"
                    })
            
            # MEDIUM 2: Caida en logins
            promedio_login = data_upper.get('PROMEDIO_LOGIN_DIA', 0)
            if 0 < promedio_login < 3:
                flags.append({
                    "flag": "LOW_LOGIN_ACTIVITY",
                    "description": "Caida significativa en logins diarios",
                    "severity": "medium"
                })
            
            # MEDIUM 3: Bajo volumen de operaciones
            if 0 < total_ops < 5:
                flags.append({
                    "flag": "LOW_TRANSACTION_VOLUME",
                    "description": "Disminucion en volumen de operaciones: poco movimiento",
                    "severity": "medium"
                })
            
            # MEDIUM 4: Muchos prestamos vigentes sin cancelacion
            prestamos_vigentes = data_upper.get('PRESTAMOS_VIGENTES', 0)
            prestamos_cancelados = data_upper.get('PRESTAMOS_CANCELADOS', 0)
            
            if prestamos_vigentes > 3 and prestamos_cancelados == 0:
                flags.append({
                    "flag": "MULTIPLE_ACTIVE_LOANS",
                    "description": "Multiples prestamos vigentes sin historial de pago",
                    "severity": "medium"
                })
            
            # === LOW SEVERITY FLAGS (Informativo) ===
            
            # LOW 1: Abandono de funcionalidades
            servicios_utilizados = data_upper.get('SERVICIOS_UTILIZADOS', 0)
            if servicios_utilizados <= 1:
                flags.append({
                    "flag": "LOW_SERVICES",
                    "description": "Abandono de funcionalidades: pocos servicios usados",
                    "severity": "low"
                })
            
            # LOW 2: Cancelacion anticipada
            tiempo_cancelacion = data_upper.get('TIEMPO_CANCELACION_PRESTAMO', 0)
            if 0 < tiempo_cancelacion < 30:
                flags.append({
                    "flag": "EARLY_REPAYMENT",
                    "description": "Cancelacion anticipada de prestamos: comportamiento atipico",
                    "severity": "low"
                })
            
            # LOW 3: Microempresa
            empleados = data_upper.get('EMPLEADOS', 0)
            if 0 < empleados < 2:
                flags.append({
                    "flag": "MICRO_BUSINESS",
                    "description": "Microempresa con muy pocos empleados",
                    "severity": "low"
                })
            
            # Ordenar por severidad: critical -> high -> medium -> low
            severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            flags.sort(key=lambda x: severity_order.get(x.get("severity"), 999))
            
            logger.info(f"Red flags calculadas: {len(flags)} detectadas")
            if flags:
                logger.debug(f"Flags: {[f['flag'] for f in flags]}")
            
            return flags
            
        except Exception as e:
            logger.error(f"Error calculando red flags: {str(e)}")
            # Retornar lista vacía en caso de error, no fallar
            return []
    
    @staticmethod
    def get_risk_level(probability: float, red_flags_count: int) -> str:
        """
        Determina nivel de riesgo basado en probabilidad y cantidad de red flags
        
        Args:
            probability: Probabilidad del modelo (0-1)
            red_flags_count: Cantidad de red flags detectadas
        
        Returns:
            String con nivel de riesgo: "bajo", "medio", "alto"
        """
        # Scoring compuesto: 70% probabilidad modelo, 30% red flags
        flags_score = min(1.0, red_flags_count / 7)  # Normalizar a 7 flags máximo
        combined_score = (probability * 0.7) + (flags_score * 0.3)
        
        if combined_score >= 0.7:
            return "alto"
        elif combined_score >= 0.4:
            return "medio"
        else:
            return "bajo"
    
    @staticmethod
    def get_risk_summary(probability: float, red_flags: List[str]) -> dict:
        """
        Genera resumen completo de riesgo
        
        Returns:
            Dict con risk_level, probability, flags_count, y recomendaciones
        """
        risk_level = RedFlagAnalyzer.get_risk_level(probability, len(red_flags))
        
        # Generar recomendaciones según riesgo
        recommendations = []
        if risk_level == "alto":
            recommendations.append("Contacto urgente con la empresa")
            recommendations.append("Revisión de cuenta y límites de crédito")
            recommendations.append("Plan de retención inmediato")
        elif risk_level == "medio":
            recommendations.append("Monitoreo activo de la cuenta")
            recommendations.append("Comunicación periódica con el cliente")
            recommendations.append("Revisión de productos y servicios adaptados")
        else:
            recommendations.append("Seguimiento normal")
            recommendations.append("Oportunidad de cross-sell")
        
        return {
            "risk_level": risk_level,
            "probability": probability,
            "flags_count": len(red_flags),
            "red_flags": red_flags,
            "recommendations": recommendations
        }
