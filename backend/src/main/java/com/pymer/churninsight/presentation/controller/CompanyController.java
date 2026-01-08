package com.pymer.churninsight.presentation.controller;

import com.pymer.churninsight.application.dto.CompanyResponseDTO;
import com.pymer.churninsight.application.service.CompanyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller REST: Company Management
 * 
 * Endpoints para:
 * - Consulta de datos de empresas
 * - Análisis de churn
 * - Segmentación y estadísticas
 * 
 * Base Path: /api/v1/companies
 * 
 * @author Senior Cloud Architect
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // ========================================================================
    // OPERACIONES BÁSICAS
    // ========================================================================

    /**
     * GET /companies/{cuit}
     * Obtiene datos completos de una empresa por CUIT
     */
    @GetMapping("/{cuit}")
    public ResponseEntity<CompanyResponseDTO> getCompanyByCuit(@PathVariable String cuit) {
        log.info("GET /companies/{} - Obtener empresa por CUIT", cuit);
        
        try {
            CompanyResponseDTO company = companyService.getCompanyByCuit(cuit);
            return ResponseEntity.ok(company);
        } catch (RuntimeException e) {
            log.error("Error obteniendo empresa: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /companies/sector/{sector}
     * Obtiene todas las empresas de un sector
     */
    @GetMapping("/sector/{sector}")
    public ResponseEntity<List<CompanyResponseDTO>> getCompaniesBySector(@PathVariable String sector) {
        log.info("GET /companies/sector/{} - Obtener empresas por sector", sector);
        
        List<CompanyResponseDTO> companies = companyService.getCompaniesBySector(sector);
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/sector/{sector}/paginated
     * Obtiene empresas de un sector con paginación
     */
    @GetMapping("/sector/{sector}/paginated")
    public ResponseEntity<Page<CompanyResponseDTO>> getCompaniesBySectorPaginated(
            @PathVariable String sector,
            Pageable pageable) {
        log.info("GET /companies/sector/{}/paginated - Página {}, Size {}", 
                sector, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<CompanyResponseDTO> companies = companyService.getCompaniesBySectorPaginated(sector, pageable);
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/provincia/{provincia}
     * Obtiene empresas de una provincia
     */
    @GetMapping("/provincia/{provincia}")
    public ResponseEntity<List<CompanyResponseDTO>> getCompaniesByProvincia(@PathVariable String provincia) {
        log.info("GET /companies/provincia/{} - Obtener empresas por provincia", provincia);
        
        List<CompanyResponseDTO> companies = companyService.getCompaniesByProvincia(provincia);
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/periodo/{periodoFiscal}
     * Obtiene empresas de un período fiscal específico
     */
    @GetMapping("/periodo/{periodoFiscal}")
    public ResponseEntity<Page<CompanyResponseDTO>> getCompaniesByPeriodo(
            @PathVariable String periodoFiscal,
            Pageable pageable) {
        log.info("GET /companies/periodo/{} - Período fiscal", periodoFiscal);
        
        Page<CompanyResponseDTO> companies = companyService.getCompaniesByPeriodo(periodoFiscal, pageable);
        return ResponseEntity.ok(companies);
    }

    // ========================================================================
    // ANÁLISIS DE CHURN
    // ========================================================================

    /**
     * GET /companies/churn/churned
     * Obtiene todas las empresas que abandonaron
     */
    @GetMapping("/churn/churned")
    public ResponseEntity<List<CompanyResponseDTO>> getChurnedCompanies() {
        log.info("GET /companies/churn/churned - Empresas que abandonaron");
        
        List<CompanyResponseDTO> companies = companyService.getChurnedCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/churn/active
     * Obtiene todas las empresas activas
     */
    @GetMapping("/churn/active")
    public ResponseEntity<List<CompanyResponseDTO>> getActiveCompanies() {
        log.info("GET /companies/churn/active - Empresas activas");
        
        List<CompanyResponseDTO> companies = companyService.getActiveCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/churn/by-date-range
     * Obtiene empresas que abandonaron en un rango de fechas
     * Query params: startDate, endDate (formato: yyyy-MM-dd)
     */
    @GetMapping("/churn/by-date-range")
    public ResponseEntity<List<CompanyResponseDTO>> getChurnedCompaniesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("GET /companies/churn/by-date-range - De {} a {}", startDate, endDate);
        
        List<CompanyResponseDTO> companies = companyService.getChurnedCompaniesByDateRange(startDate, endDate);
        return ResponseEntity.ok(companies);
    }

    /**
     * GET /companies/churn/statistics/{sector}
     * Obtiene estadísticas de churn para un sector
     */
    @GetMapping("/churn/statistics/{sector}")
    public ResponseEntity<CompanyService.ChurnStatisticsDTO> getChurnStatisticsBySector(
            @PathVariable String sector) {
        log.info("GET /companies/churn/statistics/{} - Estadísticas de churn", sector);
        
        CompanyService.ChurnStatisticsDTO stats = companyService.getChurnStatisticsBySector(sector);
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /companies/churn/high-risk
     * Obtiene empresas de alto riesgo de churn
     * Query param: periodoFiscal (ej: 2024-Q4)
     */
    @GetMapping("/churn/high-risk")
    public ResponseEntity<List<CompanyResponseDTO>> getHighRiskCompanies(
            @RequestParam(defaultValue = "2024-Q4") String periodoFiscal) {
        log.info("GET /companies/churn/high-risk - Período: {}", periodoFiscal);
        
        List<CompanyResponseDTO> companies = companyService.getHighRiskCompanies(periodoFiscal);
        return ResponseEntity.ok(companies);
    }

    // ========================================================================
    // SEGMENTACIÓN Y ESTADÍSTICAS
    // ========================================================================

    /**
     * GET /companies/segments/sectors
     * Obtiene lista de sectores únicos
     */
    @GetMapping("/segments/sectors")
    public ResponseEntity<List<String>> getAllSectors() {
        log.info("GET /companies/segments/sectors - Obtener sectores");
        
        List<String> sectors = companyService.getAllSectors();
        return ResponseEntity.ok(sectors);
    }

    /**
     * GET /companies/segments/provincias
     * Obtiene lista de provincias únicas
     */
    @GetMapping("/segments/provincias")
    public ResponseEntity<List<String>> getAllProvincias() {
        log.info("GET /companies/segments/provincias - Obtener provincias");
        
        List<String> provincias = companyService.getAllProvincias();
        return ResponseEntity.ok(provincias);
    }

    /**
     * GET /companies/count/sector/{sector}
     * Cuenta empresas por sector
     */
    @GetMapping("/count/sector/{sector}")
    public ResponseEntity<Map<String, Object>> countCompaniesBySector(@PathVariable String sector) {
        log.info("GET /companies/count/sector/{}", sector);
        
        Long count = companyService.countCompaniesBySector(sector);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sector", sector);
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /companies/count/churn/{churn}
     * Cuenta empresas por estado de churn
     * Path param: churn (0=activas, 1=abandonadas)
     */
    @GetMapping("/count/churn/{churn}")
    public ResponseEntity<Map<String, Object>> countCompaniesByChurn(@PathVariable Integer churn) {
        log.info("GET /companies/count/churn/{}", churn);
        
        Long count = companyService.countCompaniesByChurn(churn);
        String status = churn == 1 ? "Abandonadas" : "Activas";
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /companies/latest-periodo
     * Obtiene el período fiscal más reciente
     */
    @GetMapping("/latest-periodo")
    public ResponseEntity<Map<String, String>> getLatestPeriodoFiscal() {
        log.info("GET /companies/latest-periodo");
        
        String periodo = companyService.getLatestPeriodoFiscal();
        
        Map<String, String> response = new HashMap<>();
        response.put("periodoFiscal", periodo);
        
        return ResponseEntity.ok(response);
    }

    // ========================================================================
    // HEALTH CHECK
    // ========================================================================

    /**
     * GET /companies/health
     * Verifica la salud del servicio
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.info("GET /companies/health");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Company Service");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

}
