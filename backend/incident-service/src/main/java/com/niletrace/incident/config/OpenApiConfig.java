package com.niletrace.incident.config;

import com.niletrace.incident.security.AuthenticatedUser;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    static {
        // Hide AuthenticatedUser from Swagger parameters - it's injected by Spring
        // Security
        SpringDocUtils.getConfig().addRequestWrapperToIgnore(AuthenticatedUser.class);
    }

    @Bean
    public OpenAPI incidentServiceOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("NileTrace Incident Service API")
                        .description("Incident management microservice for NileTrace - AI Incident Postmortem Platform")
                        .version("0.0.1-SNAPSHOT")
                        .contact(new Contact()
                                .name("NileTrace Team")
                                .email("support@niletrace.io"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Local Development")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token obtained from auth-service /api/auth/login")));
    }
}
