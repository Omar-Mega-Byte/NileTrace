package com.niletrace.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response returned when a new analysis job is submitted.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisJobResponse {
    private UUID jobId;
    private JobStatus status;
    private String message;
}
