package com.niletrace.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private UUID id;
    private UUID incidentId;
    private String rootCauseAnalysis;
    private String impactSummary;
    private String actionItems;
    private String preventionChecklist;
    private OffsetDateTime generatedAt;
    private String modelVersion;
}
