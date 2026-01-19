package com.niletrace.analysis.controller;

import com.niletrace.analysis.dto.AnalysisJobResponse;
import com.niletrace.analysis.dto.AnalysisResultResponse;
import com.niletrace.analysis.dto.IncidentSnapshot;
import com.niletrace.analysis.dto.JobStatus;
import com.niletrace.analysis.service.AnalysisService;
import com.niletrace.analysis.service.JobManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for the Analysis Service API.
 * Provides endpoints for submitting analysis jobs and polling for results.
 */
@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analysis", description = "AI-powered incident log analysis API")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final JobManagerService jobManagerService;

    /**
     * Submit a new analysis job.
     * Returns immediately with a job ID for polling.
     */
    @PostMapping("/jobs")
    @Operation(summary = "Submit analysis job", description = "Submits an incident snapshot for AI-powered analysis. Returns a job ID for polling.")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Job accepted and queued for processing"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    public ResponseEntity<AnalysisJobResponse> submitAnalysisJob(
            @Valid @RequestBody IncidentSnapshot snapshot) {
        log.info("Received analysis request for incident {}", snapshot.getIncidentId());

        UUID jobId = analysisService.submitAnalysis(snapshot);

        AnalysisJobResponse response = AnalysisJobResponse.builder()
                .jobId(jobId)
                .status(JobStatus.QUEUED)
                .message("Analysis job queued successfully. Poll /api/analysis/jobs/" + jobId + " for results.")
                .build();

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * Get the status and result of an analysis job.
     */
    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "Get job status and result", description = "Retrieves the current status of an analysis job. If completed, includes the markdown report.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job found", content = @Content(schema = @Schema(implementation = AnalysisResultResponse.class))),
            @ApiResponse(responseCode = "404", description = "Job not found")
    })
    public ResponseEntity<AnalysisResultResponse> getJobResult(
            @Parameter(description = "Job UUID") @PathVariable UUID jobId) {
        log.debug("Fetching result for job {}", jobId);

        return jobManagerService.getJobResult(jobId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    log.warn("Job not found: {}", jobId);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns service health status")
    public ResponseEntity<HealthResponse> healthCheck() {
        return ResponseEntity.ok(new HealthResponse(
                "UP",
                jobManagerService.getActiveJobCount(),
                jobManagerService.getTotalJobCount()));
    }

    record HealthResponse(String status, int activeJobs, int totalJobs) {
    }
}
