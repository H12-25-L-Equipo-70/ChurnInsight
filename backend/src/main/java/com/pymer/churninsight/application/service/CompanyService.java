package com.pymer.churninsight.application.service;

import com.pymer.churninsight.application.dto.CompanyResponseDTO;
import com.pymer.churninsight.domain.entity.Company;
import com.pymer.churninsight.domain.repository.CompanyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de Negocio: Company Service
 * 
 * Contiene lógica de negocio para:
 * - Gestión de empresas
 * - Análisis de churn
 * - Segmentación y clasificación
 * 
 * @author Senior Cloud Architect
 * @version 1.0.0
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    // ========================================================================
    // OPERACIONES BÁSICAS
    // ========================================================================

    /**
     * Obtiene todos los datos de una empresa por CUIT
     */
    public CompanyResponseDTO getCompanyByCuit(String cuit) {
        log.debug("Obteniendo empresa con CUIT: {}", cuit);
        
        return companyRepository.findById(cuit)
            .map(this::mapToDTO)
            .orElseThrow(() -> {
                log.warn("Empresa no encontrada: {}", cuit);
                return new RuntimeException("Empresa no encontrada: " + cuit);
            });
    }

    /**
     * Obtiene todas las empresas de un sector específico
     */
    public List<CompanyResponseDTO> getCompaniesBySector(String sector) {
        log.debug("Obteniendo empresas del sector: {}", sector);
        
        return companyRepository.findBySector(sector).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene todas las empresas de una provincia
     */
    public List<CompanyResponseDTO> getCompaniesByProvincia(String provincia) {
        log.debug("Obteniendo empresas de la provincia: {}", provincia);
        
        return companyRepository.findByProvincia(provincia).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene empresas de un sector con paginación
     */
    public Page<CompanyResponseDTO> getCompaniesBySectorPaginated(String sector, Pageable pageable) {
        log.debug("Obteniendo empresas del sector: {} (página {})", sector, pageable.getPageNumber());
        
        Page<Company> page = companyRepository.findBySector(sector, pageable);
        
        return new PageImpl<>(
            page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()),
            pageable,
            page.getTotalElements()
        );
    }

    /**
     * Obtiene empresas de un período fiscal específico
     */
    public Page<CompanyResponseDTO> getCompaniesByPeriodo(String periodoFiscal, Pageable pageable) {
        log.debug("Obteniendo empresas del período: {}", periodoFiscal);
        
        Page<Company> page = companyRepository.findByPeriodoFiscal(periodoFiscal, pageable);
        
        return new PageImpl<>(
            page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()),
            pageable,
            page.getTotalElements()
        );
    }

    // ========================================================================
    // ANÁLISIS DE CHURN
    // ========================================================================

    /**
     * Obtiene empresas que abandonaron (Churn = 1)
     */
    public List<CompanyResponseDTO> getChurnedCompanies() {
        log.debug("Obteniendo empresas que abandonaron");
        
        return companyRepository.findByChurn(1).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene empresas activas (Churn = 0)
     */
    public List<CompanyResponseDTO> getActiveCompanies() {
        log.debug("Obteniendo empresas activas");
        
        return companyRepository.findByChurn(0).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene empresas que abandonaron en un rango de fechas
     */
    public List<CompanyResponseDTO> getChurnedCompaniesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Obteniendo empresas que abandonaron entre {} y {}", startDate, endDate);
        
        return companyRepository.findByChurnDateBetween(startDate, endDate).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Calcula estadísticas de churn por sector
     */
    public ChurnStatisticsDTO getChurnStatisticsBySector(String sector) {
        log.debug("Calculando estadísticas de churn para sector: {}", sector);
        
        List<Company> companies = companyRepository.findBySector(sector);
        long churnedCount = companies.stream().filter(c -> c.getChurn() == 1).count();
        long totalCount = companies.size();
        
        double churnRate = totalCount > 0 ? (double) churnedCount / totalCount * 100 : 0;
        
        return ChurnStatisticsDTO.builder()
            .sector(sector)
            .totalCompanies(totalCount)
            .churnedCompanies(churnedCount)
            .activeCompanies(totalCount - churnedCount)
            .churnRate(churnRate)
            .build();
    }

    /**
     * Obtiene empresas con alto riesgo de churn
     * Criterios: Alta deuda relativa + baja actividad
     */
    public List<CompanyResponseDTO> getHighRiskCompanies(String periodoFiscal) {
        log.debug("Identificando empresas de alto riesgo para período: {}", periodoFiscal);
        
        List<Company> companies = companyRepository.findByPeriodoFiscal(periodoFiscal);
        
        return companies.stream()
            .filter(c -> {
                // Critero 1: Deuda relativa > 30%
                BigDecimal debtRatio = c.getDebtToEquityRatio();
                boolean highDebt = debtRatio != null && debtRatio.compareTo(new BigDecimal("0.30")) > 0;
                
                // Criterio 2: Baja actividad (< 30 días activos)
                boolean lowActivity = c.getTrimestreDiasActividad() != null && 
                                     c.getTrimestreDiasActividad() < 30;
                
                return highDebt && lowActivity;
            })
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    // ========================================================================
    // SEGMENTACIÓN
    // ========================================================================

    /**
     * Obtiene todos los sectores únicos
     */
    public List<String> getAllSectors() {
        log.debug("Obteniendo lista de sectores");
        return companyRepository.findAllSectors();
    }

    /**
     * Obtiene todas las provincias únicas
     */
    public List<String> getAllProvincias() {
        log.debug("Obteniendo lista de provincias");
        return companyRepository.findAllProvincias();
    }

    /**
     * Cuenta empresas por sector
     */
    public Long countCompaniesBySector(String sector) {
        log.debug("Contando empresas del sector: {}", sector);
        return companyRepository.countBySector(sector);
    }

    /**
     * Cuenta empresas por estado de churn
     */
    public Long countCompaniesByChurn(Integer churn) {
        log.debug("Contando empresas con churn: {}", churn);
        return companyRepository.countByChurn(churn);
    }

    /**
     * Obtiene el período fiscal más reciente
     */
    public String getLatestPeriodoFiscal() {
        log.debug("Obteniendo período fiscal más reciente");
        return companyRepository.findLatestPeriodoFiscal()
            .orElse("2024-Q4");  // Valor por defecto
    }

    // ========================================================================
    // MÉTODOS PRIVADOS
    // ========================================================================

    /**
     * Convierte una entidad Company a DTO
     * Incluye cálculos de métricas derivadas
     */
    private CompanyResponseDTO mapToDTO(Company company) {
        return CompanyResponseDTO.builder()
            .cuit(company.getCuit())
            .nombreEmpresa(company.getNombreEmpresa())
            .tipoSociedad(company.getTipoSociedad())
            .sector(company.getSector())
            .provincia(company.getProvincia())
            .anoFundacion(company.getAnoFundacion())
            .empleados(company.getEmpleados())
            .telefono(company.getTelefono())
            .direccion(company.getDireccion())
            .periodoFiscal(company.getPeriodoFiscal())
            .ingresos(company.getIngresos())
            .gastos(company.getGastos())
            .margen(company.getMargen())
            .deuda(company.getDeuda())
            .activos(company.getActivos())
            .prestamosSolicitados(company.getPrestamos_solicitados())
            .prestamosAprobados(company.getPrestamos_aprobados())
            .prestamosCancelados(company.getPrestamos_cancelados())
            .prestamosVigentes(company.getPrestamos_vigentes())
            .churn(company.getChurn())
            .churnDate(company.getChurnDate())
            .companyAgeRange(company.getCompanyAgeRange())
            .debtToEquityRatio(company.getDebtToEquityRatio())
            .operatingMarginPercent(company.getOperatingMarginPercent())
            .loanApprovalRate(company.getLoanApprovalRate())
            .build();
    }

    // ========================================================================
    // DTO AUXILIARES
    // ========================================================================

    /**
     * DTO para estadísticas de churn
     */
    @lombok.Data
    @lombok.Builder
    public static class ChurnStatisticsDTO {
        private String sector;
        private Long totalCompanies;
        private Long churnedCompanies;
        private Long activeCompanies;
        private Double churnRate;
    }

}
