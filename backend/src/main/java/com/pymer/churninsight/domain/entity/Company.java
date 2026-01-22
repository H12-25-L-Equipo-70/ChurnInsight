package com.pymer.churninsight.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA: Company (EMPRESAS)
 * 
 * Mapea datos financieros y operacionales de Pymes argentinas
 * para análisis de churn y predicción de riesgo.
 * 
 * Usa tipos de datos nativos de Oracle:
 * - VARCHAR2 para textos
 * - NUMBER para valores financieros (precisión)
 * - DATE para fechas
 * 
 * @author Senior Cloud Architect
 * @version 1.0.0
 */
@Entity
@Table(name = "EMPRESAS", schema = "PYMERDB")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    // ========================================================================
    // IDENTIFICACIÓN BÁSICA
    // ========================================================================

    @Id
    @Column(name = "CUIT", length = 20, nullable = false)
    private String cuit;

    @Column(name = "NOMBRE_EMPRESA", length = 255, nullable = false)
    private String nombreEmpresa;

    @Column(name = "TIPO_SOCIEDAD", length = 50)
    private String tipoSociedad;

    @Column(name = "SECTOR", length = 100)
    private String sector;

    @Column(name = "PROVINCIA", length = 100)
    private String provincia;

    @Column(name = "AÑO_FUNDACION")
    private Integer anoFundacion;

    @Column(name = "EMPLEADOS")
    private Integer empleados;

    @Column(name = "TELEFONO", length = 30)
    private String telefono;

    @Column(name = "DIRECCION", length = 500)
    private String direccion;

    // ========================================================================
    // DATOS FINANCIEROS TRIMESTRALES
    // ========================================================================

    @Column(name = "PERIODO_FISCAL", length = 10, nullable = false)
    private String periodoFiscal;  // Formato: 2024-Q1

    @Column(name = "INGRESOS", precision = 18, scale = 2)
    private BigDecimal ingresos;

    @Column(name = "GASTOS", precision = 18, scale = 2)
    private BigDecimal gastos;

    @Column(name = "MARGEN", precision = 18, scale = 2)
    private BigDecimal margen;

    @Column(name = "DEUDA", precision = 18, scale = 2)
    private BigDecimal deuda;

    @Column(name = "ACTIVOS", precision = 18, scale = 2)
    private BigDecimal activos;

    // ========================================================================
    // DATOS DE PRÉSTAMOS
    // ========================================================================

    @Column(name = "PRESTAMOS_SOLICITADOS")
    private Integer prestamos_solicitados;

    @Column(name = "PRESTAMOS_APROBADOS")
    private Integer prestamos_aprobados;

    @Column(name = "PRESTAMOS_CANCELADOS")
    private Integer prestamos_cancelados;

    @Column(name = "PRESTAMOS_VIGENTES")
    private Integer prestamos_vigentes;

    @Column(name = "TICKET_PROMEDIO_SOLICITADO", precision = 18, scale = 2)
    private BigDecimal ticketPromedioSolicitado;

    @Column(name = "TICKET_PROMEDIO_APROBADO", precision = 18, scale = 2)
    private BigDecimal ticketPromedioAprobado;

    @Column(name = "MONTO_SOLICITADO", precision = 18, scale = 2)
    private BigDecimal montoSolicitado;

    @Column(name = "MONTO_APROBADO", precision = 18, scale = 2)
    private BigDecimal montoAprobado;

    @Column(name = "TIEMPO_CANCELACION_PRESTAMO")
    private Integer tiempoCancelacionPrestamo;  // Días

    // ========================================================================
    // DATOS DE ACTIVIDAD
    // ========================================================================

    @Column(name = "TRIMESTRE_DIAS_ACTIVIDAD")
    private Integer trimestreDiasActividad;

    @Column(name = "TRIMESTRE_DIAS_INACTIVIDAD")
    private Integer trimestreDiasInactividad;

    @Column(name = "PROMEDIO_LOGIN_DIA", precision = 10, scale = 2)
    private BigDecimal promedioLoginDia;

    @Column(name = "TOTAL_LOGIN_DIA")
    private Integer totalLoginDia;

    // ========================================================================
    // DATOS DE TRANSACCIONES
    // ========================================================================

    @Column(name = "TRANSFERENCIAS")
    private Integer transferencias;

    @Column(name = "PAGOS")
    private Integer pagos;

    @Column(name = "CREDITOS")
    private Integer creditos;

    @Column(name = "INVERSIONES")
    private Integer inversiones;

    @Column(name = "SERVICIOS_UTILIZADOS")
    private Integer serviciosUtilizados;

    // ========================================================================
    // ESTADO DE CHURN (TARGET VARIABLE)
    // ========================================================================

    @Column(name = "CHURN")
    private Integer churn;  // 0 = No abandonó, 1 = Abandonó

    @Column(name = "CHURN_DATE")
    private LocalDate churnDate;

    // ========================================================================
    // AUDITORÍA
    // ========================================================================

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // ========================================================================
    // MÉTODOS HELPER
    // ========================================================================

    /**
     * Calcula el ratio de endeudamiento
     */
    public BigDecimal getDebtToEquityRatio() {
        if (activos == null || activos.equals(BigDecimal.ZERO)) {
            return BigDecimal.ZERO;
        }
        return deuda.divide(activos, 4, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Calcula el margen operacional (%)
     */
    public BigDecimal getOperatingMarginPercent() {
        if (ingresos == null || ingresos.equals(BigDecimal.ZERO)) {
            return BigDecimal.ZERO;
        }
        return margen.divide(ingresos, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100));
    }

    /**
     * Calcula la tasa de aprobación de préstamos
     */
    public BigDecimal getLoanApprovalRate() {
        if (prestamos_solicitados == null || prestamos_solicitados == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(prestamos_aprobados)
                .divide(new BigDecimal(prestamos_solicitados), 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100));
    }

    /**
     * Verifica si la empresa está activa en el trimestre
     */
    public boolean isActiveThisQuarter() {
        if (trimestreDiasActividad == null) {
            return false;
        }
        return trimestreDiasActividad > 0;
    }

    /**
     * Obtiene el rango de edad de la empresa
     */
    public String getCompanyAgeRange() {
        if (anoFundacion == null) {
            return "UNKNOWN";
        }
        int age = LocalDate.now().getYear() - anoFundacion;
        if (age < 2) return "STARTUP";
        if (age < 5) return "YOUNG";
        if (age < 10) return "ESTABLISHED";
        return "MATURE";
    }

}
