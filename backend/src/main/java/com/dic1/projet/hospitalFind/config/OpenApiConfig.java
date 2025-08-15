package com.dic1.projet.hospitalFind.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info()
                        .title("HealthMap Senegal API")
                        .description("API pour la gestion des établissements de santé, services, utilisateurs et avis.")
                        .version("v1")
                        .contact(new Contact().name("Equipe HealthMap")))
                .externalDocs(new ExternalDocumentation()
                        .description("Documentation complète")
                        .url("/api/swagger-ui/index.html"));
    }
}


