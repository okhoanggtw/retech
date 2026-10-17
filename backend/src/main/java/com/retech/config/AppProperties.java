package com.retech.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private boolean embeddedMongo;
    private boolean seedData = true;
    private String frontendUrl;
    private String backendUrl;
    private String corsOrigins;
    private Jwt jwt = new Jwt();
    private Admin admin = new Admin();
    private Gemini gemini = new Gemini();
    private PayOS payos = new PayOS();

    public List<String> corsOriginList() {
        return Arrays.stream(corsOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    @Data
    public static class Jwt {
        private String secret;
        private long expirationHours = 72;
    }

    @Data
    public static class Admin {
        private String email;
        private String password;
    }

    @Data
    public static class Gemini {
        private String apiKey;
        private String model;
        private String baseUrl;

        public boolean enabled() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    @Data
    public static class PayOS {
        private String clientId;
        private String apiKey;
        private String checksumKey;
        private String baseUrl;

        public boolean enabled() {
            return clientId != null && !clientId.isBlank()
                    && apiKey != null && !apiKey.isBlank()
                    && checksumKey != null && !checksumKey.isBlank();
        }
    }
}
