package com.pymer.churninsight.domain.repository;

import com.pymer.churninsight.domain.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para acceso a datos de Companies (Empresas)
 * 
 * Proporciona operaciones CRUD y consultas específicas del dominio
 * para análisis de churn.
 * 
 * @author Senior Cloud Architect
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {

    /**
     * Obtiene todas las empresas de un sector específico
     */
    List<Company> findBySector(String sector);

    /**
     * Obtiene todas las empresas de una provincia específica
     */
    List<Company> findByProvincia(String provincia);

    /**
     * Obtiene empresas con estado de churn
     */
    List<Company> findByChurn(Integer churn);

    /**
     * Obtiene empresas que abandonaron en un rango de fechas
     */
    List<Company> findByChurnDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Obtiene empresas de un sector con paginación
     */
    Page<Company> findBySector(String sector, Pageable pageable);

    /**
     * Obtiene empresas activas en un trimestre específico
     */
    List<Company> findByPeriodoFiscal(String periodoFiscal);

    /**
     * Busca empresas por período fiscal con paginación
     */
    Page<Company> findByPeriodoFiscal(String periodoFiscal, Pageable pageable);

    /**
     * Obtiene empresas por rango de ingresos para segmentación
     */
    @Query("SELECT c FROM Company c WHERE c.ingresos >= :minIngresos AND c.ingresos <= :maxIngresos")
    List<Company> findByIngresosBetween(
        @Param("minIngresos") java.math.BigDecimal minIngresos,
        @Param("maxIngresos") java.math.BigDecimal maxIngresos
    );

    /**
     * Obtiene empresas con alta deuda relativa (factor de riesgo)
     */
    @Query("SELECT c FROM Company c WHERE (c.deuda / c.activos) > :debtRatio ORDER BY (c.deuda / c.activos) DESC")
    List<Company> findHighDebtCompanies(@Param("debtRatio") double debtRatio);

    /**
     * Obtiene empresas inactivas en un trimestre (indicador de churn)
     */
    @Query("SELECT c FROM Company c WHERE c.trimestreDiasActividad < :minDays AND c.periodoFiscal = :periodo")
    List<Company> findInactiveCompaniesByQuarter(
        @Param("minDays") Integer minDays,
        @Param("periodo") String periodo
    );

    /**
     * Cuenta empresas por sector
     */
    Long countBySector(String sector);

    /**
     * Cuenta empresas por estado de churn
     */
    Long countByChurn(Integer churn);

    /**
     * Obtiene el período fiscal más reciente con datos
     */
    @Query("SELECT DISTINCT c.periodoFiscal FROM Company c ORDER BY c.periodoFiscal DESC LIMIT 1")
    Optional<String> findLatestPeriodoFiscal();

    /**
     * Obtiene todos los sectores únicos
     */
    @Query("SELECT DISTINCT c.sector FROM Company c ORDER BY c.sector")
    List<String> findAllSectors();

    /**
     * Obtiene todas las provincias únicas
     */
    @Query("SELECT DISTINCT c.provincia FROM Company c ORDER BY c.provincia")
    List<String> findAllProvincias();

}
