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
    def calcular_red_flags(data: dict) -> List[str]:
        """
        Calcula red flags (señales de alerta) basadas en datos de empresa
        
        Args:
            data: Diccionario con campos de empresa (puede estar en uppercase o lowercase)
        
        Returns:
            Lista de strings con flags detectadas
        """
        flags = []
        
        # Normalizar keys a uppercase (compatibilidad con EmpresaInput)
        data_upper = {k.upper(): v for k, v in data.items()}
        
        try:
            # === ENGAGEMENT (Actividad en plataforma) ===
            
            # Flag 1: Alta inactividad
            dias_actividad = data_upper.get('TRIMESTRE_DIAS_ACTIVIDAD', 90)
            dias_inactividad = data_upper.get('TRIMESTRE_DIAS_INACTIVIDAD', 0)
            
            total_dias = dias_actividad + dias_inactividad
            if total_dias > 0:
                ratio_inactividad = dias_inactividad / total_dias
            else:
                ratio_inactividad = 0
                
            if ratio_inactividad > 0.5:
                flags.append("Alta inactividad en la app")
            
            # Flag 2: Caída en logins
            promedio_login = data_upper.get('PROMEDIO_LOGIN_DIA', 0)
            if promedio_login < 3:
                flags.append("Caída significativa en logins diarios")
            
            # Flag 3: Abandono de funcionalidades
            servicios_utilizados = data_upper.get('SERVICIOS_UTILIZADOS', 0)
            if servicios_utilizados <= 1:
                flags.append("Abandono de funcionalidades: pocos servicios usados")
            
            # === LIQUIDEZ Y FINANZAS ===
            
            # Flag 4: Baja aprobación de préstamos
            monto_solicitado = data_upper.get('MONTO_SOLICITADO', 0)
            monto_aprobado = data_upper.get('MONTO_APROBADO', 0)
            
            if monto_solicitado > 0:
                ratio_aprobacion = monto_aprobado / monto_solicitado
                if ratio_aprobacion < 0.3:
                    flags.append("Baja aprobación de préstamos")
            
            # Flag 5: Margen negativo
            ingresos = data_upper.get('INGRESOS', 0)
            gastos = data_upper.get('GASTOS', 0)
            margen = ingresos - gastos
            
            if margen < 0:
                flags.append("Margen negativo persistente")
            
            # Flag 6: Rentabilidad muy baja
            if ingresos > 0:
                rentabilidad = margen / ingresos
                if rentabilidad < 0.1:  # Menos del 10% de margen
                    flags.append("Rentabilidad muy baja (< 10%)")
            
            # === PRODUCTO Y CRÉDITO ===
            
            # Flag 7: Cancelación anticipada de préstamos
            tiempo_cancelacion = data_upper.get('TIEMPO_CANCELACION_PRESTAMO', 0)
            if 0 < tiempo_cancelacion < 30:
                flags.append("Cancelación anticipada de préstamos")
            
            # Flag 8: Disminución en volumen de operaciones
            transferencias = data_upper.get('TRANSFERENCIAS', 0)
            pagos = data_upper.get('PAGOS', 0)
            total_ops = transferencias + pagos
            
            if total_ops < 5:
                flags.append("Disminución en volumen de operaciones")
            
            # === FLAGS ADICIONALES (mejoras respecto a new_notebook.md) ===
            
            # Flag 9: Alto endeudamiento
            deuda = data_upper.get('DEUDA', 0)
            activos = data_upper.get('ACTIVOS', 1)
            
            ratio_deuda = deuda / activos if activos > 0 else 0
            if ratio_deuda > 0.7:
                flags.append("Alto ratio de endeudamiento (>70%)")
            
            # Flag 10: Solicitudes sin aprobación
            prestamos_solicitados = data_upper.get('PRESTAMOS_SOLICITADOS', 0)
            prestamos_aprobados = data_upper.get('PRESTAMOS_APROBADOS', 0)
            
            if prestamos_solicitados > 0 and prestamos_aprobados == 0:
                flags.append("Solicitudes de crédito sin aprobación")
            
            # Flag 11: Bajo número de empleados
            empleados = data_upper.get('EMPLEADOS', 0)
            if empleados == 0:
                flags.append("Información de empleados no registrada")
            elif empleados < 2:
                flags.append("Microempresa con muy pocos empleados")
            
            # Flag 12: Inactividad extrema
            if dias_actividad == 0:
                flags.append("Empresa completamente inactiva en el trimestre")
            
            # Flag 13: Sin movimiento transaccional
            creditos = data_upper.get('CREDITOS', 0)
            inversiones = data_upper.get('INVERSIONES', 0)
            
            if total_ops == 0 and creditos == 0 and inversiones == 0:
                flags.append("Sin movimiento transaccional alguno")
            
            # Flag 14: Muchos préstamos vigentes sin cancelación
            prestamos_vigentes = data_upper.get('PRESTAMOS_VIGENTES', 0)
            prestamos_cancelados = data_upper.get('PRESTAMOS_CANCELADOS', 0)
            
            if prestamos_vigentes > 3 and prestamos_cancelados == 0:
                flags.append("Múltiples préstamos vigentes sin historial de pago")
            
            logger.info(f"Red flags calculadas: {len(flags)} detectadas")
            if flags:
                logger.debug(f"Flags: {flags}")
            
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
