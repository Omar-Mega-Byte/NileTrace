package com.niletrace.analysis.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI analysisServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NileTrace Analysis Service API")
                        .description("AI-powered log analysis microservice with PII scrubbing and LLM integration")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("NileTrace Team")
                                .email("team@niletrace.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
