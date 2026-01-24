package com.pymer.churninsight.presentation.controller;

import com.pymer.churninsight.domain.entity.Prediction;
import com.pymer.churninsight.domain.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/predictions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Habilita CORS para permitir peticiones desde Angular (localhost:4200)
public class PredictionController {

    private final PredictionRepository predictionRepository;

    /**
     * Obtener historial completo de predicciones
     */
    @GetMapping("/list")
    public ResponseEntity<List<Prediction>> getAllPredictions() {
        log.info("Solicitando historial completo de predicciones");
        List<Prediction> predictions = predictionRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(predictions);
    }

    /**
     * Obtener predicciones por CUIT
     */
    @GetMapping("/by-cuit/{cuit}")
    public ResponseEntity<List<Prediction>> getPredictionsByCuit(@PathVariable String cuit) {
        log.info("Solicitando predicciones para CUIT: {}", cuit);
        List<Prediction> predictions = predictionRepository.findByCuitOrderByTimestampDesc(cuit);
        return ResponseEntity.ok(predictions);
    }

    /**
     * Eliminar una predicción
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrediction(@PathVariable Long id) {
        log.info("Eliminando predicción ID: {}", id);
        if (predictionRepository.existsById(id)) {
            predictionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}