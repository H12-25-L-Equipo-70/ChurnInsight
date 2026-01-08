package com.pymer.churninsight.config;

import lombok.extern.slf4j.Slf4j;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Configuración de DataSource Oracle con soporte para Wallet
 * 
 * Utiliza Oracle UCP (Universal Connection Pool) para máximo rendimiento
 * y el Oracle Wallet para autenticación segura sin exponer credenciales.
 * 
 * Variables de entorno requeridas:
 * - ORACLE_WALLET_PATH: Ruta al directorio del wallet descomprimido
 * - ORACLE_DB_NAME: Nombre del servicio en tnsnames.ora (ej: pymerdb_high)
 * - SPRING_DATASOURCE_USERNAME: Usuario de BD
 * - SPRING_DATASOURCE_PASSWORD: Contraseña (si no usa wallet exclusivamente)
 * 
 * @author Senior Cloud Architect & DevOps Engineer
 * @version 1.0.0
 */
@Slf4j
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.pymer.churninsight.domain.repository"
)
public class OracleDataSourceConfig {

    private static final String ORACLE_JDBC_DRIVER = "oracle.jdbc.driver.OracleDriver";
    private static final int CONNECTION_POOL_MIN_SIZE = 5;
    private static final int CONNECTION_POOL_MAX_SIZE = 30;
    private static final int CONNECTION_POOL_INCREMENT = 5;
    private static final long TIMEOUT_SECONDS = 30;

    /**
     * Crea el DataSource utilizando Oracle UCP con Wallet
     * 
     * El Wallet proporciona:
     * - Autenticación X.509 segura
     * - Certificados SSL/TLS
     * - Credenciales encriptadas (si se configura)
     */
    @Bean
    @Primary
    public DataSource oracleDataSource(OracleWalletProperties walletProps) 
            throws SQLException {
        
        log.info("=== Inicializando Oracle DataSource con Wallet ===");
        log.info("Wallet Path: {}", walletProps.getWalletPath());
        log.info("Database Name: {}", walletProps.getDatabaseName());
        log.info("TNS Admin: {}", walletProps.getTnsAdminPath());

        try {
            // Verificar que el archivo tnsnames.ora existe
            java.nio.file.Path tnsPath = 
                java.nio.file.Paths.get(walletProps.getTnsAdminPath(), "tnsnames.ora");
            
            if (!java.nio.file.Files.exists(tnsPath)) {
                throw new IllegalArgumentException(
                    "tnsnames.ora no encontrado en: " + tnsPath
                );
            }

            // Crear PoolDataSource con UCP
            PoolDataSource poolDataSource = PoolDataSourceFactory.getPoolDataSource();

            // Configurar propiedad de TNS_ADMIN para que Oracle encuentre tnsnames.ora
            poolDataSource.setConnectionFactoryClassName(ORACLE_JDBC_DRIVER);
            
            // Connection String usando TNS Alias (desde tnsnames.ora)
            // Formato: jdbc:oracle:thin:@[TNS_ALIAS]
            String connectionUrl = String.format(
                "jdbc:oracle:thin:@%s", 
                walletProps.getDatabaseName()
            );
            
            poolDataSource.setURL(connectionUrl);

            // Propiedades de conexión para el Wallet
            Properties connProps = new Properties();
            
            // Sistema propiedad para TNS_ADMIN (usado por Oracle JDBC)
            connProps.setProperty("oracle.net.tns_admin", walletProps.getTnsAdminPath());
            
            // Propiedades SSL/TLS para Wallet
            connProps.setProperty("javax.net.ssl.trustStore", 
                walletProps.getWalletPath() + "/truststore.jks");
            connProps.setProperty("javax.net.ssl.trustStorePassword", 
                walletProps.getTrustStorePassword());
            connProps.setProperty("javax.net.ssl.trustStoreType", "JKS");
            
            connProps.setProperty("javax.net.ssl.keyStore", 
                walletProps.getWalletPath() + "/keystore.jks");
            connProps.setProperty("javax.net.ssl.keyStorePassword", 
                walletProps.getKeyStorePassword());
            connProps.setProperty("javax.net.ssl.keyStoreType", "JKS");

            // Aplicar propiedades al DataSource
            poolDataSource.setConnectionProperties(connProps);

            // Configurar credenciales (si no usa autenticación Wallet pura)
            if (walletProps.getUsername() != null && !walletProps.getUsername().isEmpty()) {
                poolDataSource.setUser(walletProps.getUsername());
                poolDataSource.setPassword(walletProps.getPassword());
            }

            // Configurar parámetros de Pool
            poolDataSource.setInitialPoolSize(CONNECTION_POOL_MIN_SIZE);
            poolDataSource.setMinPoolSize(CONNECTION_POOL_MIN_SIZE);
            poolDataSource.setMaxPoolSize(CONNECTION_POOL_MAX_SIZE);
            poolDataSource.setConnectionIncrement(CONNECTION_POOL_INCREMENT);
            poolDataSource.setConnectionWaitTimeout(TIMEOUT_SECONDS);
            poolDataSource.setInactivityTimeout(900); // 15 minutos
            poolDataSource.setTimeoutCheckInterval(60); // Verificar cada minuto

            // Validación de conexión
            poolDataSource.setValidateConnectionOnBorrow(true);
            poolDataSource.setConnectionValidationTimeout(5);

            log.info("✓ Oracle DataSource configurado correctamente con UCP");
            log.info("  Pool Size: {} - {}", CONNECTION_POOL_MIN_SIZE, CONNECTION_POOL_MAX_SIZE);
            log.info("  Connection URL: {}", connectionUrl);
            
            return poolDataSource;

        } catch (SQLException e) {
            log.error("✗ Error configurando Oracle DataSource: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("✗ Error inesperado en configuración de DataSource: {}", e.getMessage(), e);
            throw new RuntimeException("Falló la configuración del DataSource", e);
        }
    }

    /**
     * Configura EntityManagerFactory para JPA
     */
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            DataSource dataSource,
            JpaProperties jpaProperties) {
        
        LocalContainerEntityManagerFactoryBean emf = 
            new LocalContainerEntityManagerFactoryBean();
        
        emf.setDataSource(dataSource);
        emf.setPackagesToScan("com.pymer.churninsight.domain.entity");
        emf.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        
        // Configurar propiedades de Hibernate
        Properties hibernateProps = new Properties();
        hibernateProps.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        hibernateProps.put("hibernate.jdbc.batch_size", 20);
        hibernateProps.put("hibernate.order_inserts", true);
        hibernateProps.put("hibernate.order_updates", true);
        hibernateProps.put("hibernate.generate_statistics", false);
        hibernateProps.put("hibernate.use_sql_comments", true);
        
        emf.setJpaProperties(hibernateProps);
        
        return emf;
    }

    /**
     * Configura el TransactionManager para JPA
     */
    @Bean
    public PlatformTransactionManager transactionManager(
            EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    /**
     * Propiedades del Oracle Wallet desde application.properties
     */
    @org.springframework.boot.context.properties.ConfigurationProperties(
        prefix = "oracle.wallet"
    )
    public static class OracleWalletProperties {
        private String walletPath;
        private String tnsAdminPath;
        private String databaseName;
        private String username;
        private String password;
        private String trustStorePassword = "wallet_password"; // Valor por defecto
        private String keyStorePassword = "wallet_password";    // Valor por defecto

        // Getters y Setters
        public String getWalletPath() {
            return walletPath;
        }

        public void setWalletPath(String walletPath) {
            this.walletPath = walletPath;
        }

        public String getTnsAdminPath() {
            return tnsAdminPath;
        }

        public void setTnsAdminPath(String tnsAdminPath) {
            this.tnsAdminPath = tnsAdminPath;
        }

        public String getDatabaseName() {
            return databaseName;
        }

        public void setDatabaseName(String databaseName) {
            this.databaseName = databaseName;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getTrustStorePassword() {
            return trustStorePassword;
        }

        public void setTrustStorePassword(String trustStorePassword) {
            this.trustStorePassword = trustStorePassword;
        }

        public String getKeyStorePassword() {
            return keyStorePassword;
        }

        public void setKeyStorePassword(String keyStorePassword) {
            this.keyStorePassword = keyStorePassword;
        }
    }

    @Bean
    @ConfigurationProperties(prefix = "oracle.wallet")
    public OracleWalletProperties oracleWalletProperties() {
        return new OracleWalletProperties();
    }
}
