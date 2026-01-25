package com.pymer.churninsight.domain.repository;

import com.pymer.churninsight.domain.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    
    // Buscar por CUIT ordenado por fecha descendente
    List<Prediction> findByCuitOrderByTimestampDesc(String cuit);
    
    // Obtener todas ordenadas por fecha (para el historial general)
    List<Prediction> findAllByOrderByTimestampDesc();
}