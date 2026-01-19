package com.niletrace.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response containing the status and result of an analysis job.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultResponse {
    private UUID jobId;
    private UUID incidentId;
    private JobStatus status;
    private String markdownReport;
    private String errorMessage;
    private Instant createdAt;
    private Instant completedAt;
    private int piiEntitiesMasked;
}
