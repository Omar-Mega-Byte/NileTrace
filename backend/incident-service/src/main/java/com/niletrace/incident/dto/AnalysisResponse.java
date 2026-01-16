package com.niletrace.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO from analysis-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {

    private String rootCauseAnalysis;
    private String impactSummary;
    private String actionItems;
    private String preventionChecklist;
    private String modelVersion;
}
