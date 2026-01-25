package com.pymer.churninsight.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO: Respuesta de Empresa
 * 
 * Contiene datos de una empresa sin exponer la entidad JPA directamente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponseDTO {

    @JsonProperty("cuit")
    private String cuit;

    @JsonProperty("nombre_empresa")
    private String nombreEmpresa;

    @JsonProperty("tipo_sociedad")
    private String tipoSociedad;

    @JsonProperty("sector")
    private String sector;

    @JsonProperty("provincia")
    private String provincia;

    @JsonProperty("ano_fundacion")
    private Integer anoFundacion;

    @JsonProperty("empleados")
    private Integer empleados;

    @JsonProperty("telefono")
    private String telefono;

    @JsonProperty("direccion")
    private String direccion;

    @JsonProperty("periodo_fiscal")
    private String periodoFiscal;

    @JsonProperty("ingresos")
    private BigDecimal ingresos;

    @JsonProperty("gastos")
    private BigDecimal gastos;

    @JsonProperty("margen")
    private BigDecimal margen;

    @JsonProperty("deuda")
    private BigDecimal deuda;

    @JsonProperty("activos")
    private BigDecimal activos;

    @JsonProperty("prestamos_solicitados")
    private Integer prestamosSolicitados;

    @JsonProperty("prestamos_aprobados")
    private Integer prestamosAprobados;

    @JsonProperty("prestamos_cancelados")
    private Integer prestamosCancelados;

    @JsonProperty("prestamos_vigentes")
    private Integer prestamosVigentes;

    @JsonProperty("churn")
    private Integer churn;

    @JsonProperty("churn_date")
    private LocalDate churnDate;

    @JsonProperty("company_age_range")
    private String companyAgeRange;

    @JsonProperty("debt_to_equity_ratio")
    private BigDecimal debtToEquityRatio;

    @JsonProperty("operating_margin_percent")
    private BigDecimal operatingMarginPercent;

    @JsonProperty("loan_approval_rate")
    private BigDecimal loanApprovalRate;

}
