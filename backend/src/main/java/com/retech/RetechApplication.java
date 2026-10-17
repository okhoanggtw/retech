package com.retech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication(exclude = org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
@EnableMongoAuditing
public class RetechApplication {
    public static void main(String[] args) {
        SpringApplication.run(RetechApplication.class, args);
    }
}
