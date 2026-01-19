package com.niletrace.incident.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO when submitting an analysis job.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisJobResponse {

    private UUID jobId;
    private String status;
    private String message;
}
