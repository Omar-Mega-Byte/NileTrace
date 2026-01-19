package com.niletrace.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Request DTO for submitting an analysis job to analysis-service.
 * Matches the IncidentSnapshot expected by analysis-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisJobRequest {

    private UUID incidentId;
    private String title;
    private String description;
    private String severity;
    private String logContent;
    private Instant incidentStartTime;
    private Instant createdAt;
    
    // Optional fields for better analysis
    private String serviceName;
    private String environment;
    private String region;
}
