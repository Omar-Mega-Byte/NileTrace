package com.niletrace.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO sent to analysis-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {

    private String incidentTitle;
    private String incidentDescription;
    private String severity;
    private String logContent;
}
