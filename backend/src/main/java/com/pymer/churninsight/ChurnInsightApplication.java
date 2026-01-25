package com.pymer.churninsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * ChurnInsight Backend Application
 * 
 * Plataforma B2B para predicción de abandono (Churn) de Pymes argentinas
 * usando IA e Oracle Autonomous Database en OCI.
 * 
 * @author Senior Cloud Architect
 * @version 1.0.0
 */
@SpringBootApplication
@EnableFeignClients
public class ChurnInsightApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChurnInsightApplication.class, args);
    }

}
