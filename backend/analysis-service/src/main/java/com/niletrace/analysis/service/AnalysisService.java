package com.niletrace.analysis.service;

import com.niletrace.analysis.dto.IncidentSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Core analysis service that orchestrates the analysis workflow:
 * 1. PII Sanitization
 * 2. LLM Report Generation
 * 3. Job Status Management
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AnalysisService {

    private final PiiSanitizerService piiSanitizerService;
    private final GroqClientService groqClientService;
    private final JobManagerService jobManagerService;

    /**
     * Submits a new analysis job and returns immediately with the job ID.
     * The analysis runs asynchronously.
     *
     * @param snapshot The incident snapshot to analyze
     * @return The job ID for tracking
     */
    public UUID submitAnalysis(IncidentSnapshot snapshot) {
        UUID jobId = jobManagerService.createJob(snapshot);
        processAnalysisAsync(jobId);
        return jobId;
    }

    /**
     * Asynchronously processes the analysis job.
     * This method runs in a separate thread from the analysisExecutor pool.
     */
    @Async("analysisExecutor")
    public void processAnalysisAsync(UUID jobId) {
        log.info("Starting async analysis for job {}", jobId);

        try {
            // Update status to PROCESSING
            jobManagerService.markProcessing(jobId);

            // Get the snapshot
            IncidentSnapshot snapshot = jobManagerService.getJobSnapshot(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

            // Step 1: Sanitize PII from log content
            log.debug("Sanitizing PII for job {}", jobId);
            PiiSanitizerService.SanitizationResult sanitizationResult = piiSanitizerService
                    .sanitize(snapshot.getLogContent());

            // Step 2: Generate postmortem report via Groq LLM
            log.debug("Generating postmortem for job {}", jobId);
            String markdownReport = groqClientService.generatePostmortemReport(
                    snapshot,
                    sanitizationResult.sanitizedContent());

            // Step 3: Mark job as completed
            jobManagerService.markCompleted(jobId, markdownReport, sanitizationResult.totalMaskedEntities());

            log.info("Analysis completed for job {}. PII entities masked: {}",
                    jobId, sanitizationResult.totalMaskedEntities());

        } catch (Exception e) {
            log.error("Analysis failed for job {}: {}", jobId, e.getMessage(), e);
            jobManagerService.markFailed(jobId, e.getMessage());
        }
    }
}
