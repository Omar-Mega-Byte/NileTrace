package com.niletrace.incident.service;

import com.niletrace.incident.dto.AnalysisRequest;
import com.niletrace.incident.dto.AnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class AnalysisServiceClient {

    private final WebClient webClient;

    public AnalysisServiceClient(@Value("${analysis.service.url}") String analysisServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(analysisServiceUrl)
                .build();
    }

    /**
     * Sends log data to analysis-service for AI processing
     */
    public AnalysisResponse analyzeIncident(AnalysisRequest request) {
        log.info("Sending analysis request to analysis-service for incident: {}", request.getIncidentTitle());

        try {
            return webClient.post()
                    .uri("/api/analysis/analyze")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AnalysisResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to call analysis-service: {}", e.getMessage());
            throw new RuntimeException("Analysis service unavailable: " + e.getMessage());
        }
    }
}
