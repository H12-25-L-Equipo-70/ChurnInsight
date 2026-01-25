package com.pymer.churninsight.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICCIONES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "CUIT", length = 20, nullable = false)
    private String cuit;

    @Column(name = "NOMBRE_EMPRESA", length = 255)
    private String nombreEmpresa;

    @Column(name = "SECTOR", length = 100)
    private String sector;

    @Column(name = "PROVINCIA", length = 100)
    private String provincia;

    @Column(name = "PROBABILIDAD", precision = 5, scale = 4)
    private BigDecimal churnProbability;

    @Column(name = "PREDICCION")
    private Integer churnPrediction; // 0 o 1

    // Se almacena como JSON String en la BD
    @Lob
    @Column(name = "RED_FLAGS")
    private String redFlags;

    @Column(name = "THRESHOLD_USED", precision = 5, scale = 4)
    private BigDecimal thresholdUsed;

    @Column(name = "CONFIDENCE", precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime timestamp;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    // Getters para compatibilidad con el frontend si es necesario
    public String getSaved_at() {
        return createdAt != null ? createdAt.toString() : null;
    }
    
    public String getChurn_probability() {
        return churnProbability != null ? churnProbability.toString() : "0";
    }
}