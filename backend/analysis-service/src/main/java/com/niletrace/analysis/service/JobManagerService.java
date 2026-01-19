package com.niletrace.analysis.service;

import com.niletrace.analysis.dto.AnalysisResultResponse;
import com.niletrace.analysis.dto.IncidentSnapshot;
import com.niletrace.analysis.dto.JobStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing analysis jobs with in-memory storage.
 * Handles job lifecycle: creation, status updates, result storage, and cleanup.
 */
@Service
@Slf4j
public class JobManagerService {

    private final Map<UUID, AnalysisJob> jobs = new ConcurrentHashMap<>();

    @Value("${analysis.job.retention-hours:24}")
    private int retentionHours;

    /**
     * Creates a new analysis job in QUEUED status.
     *
     * @param snapshot The incident snapshot to analyze
     * @return The generated job ID
     */
    public UUID createJob(IncidentSnapshot snapshot) {
        UUID jobId = UUID.randomUUID();
        AnalysisJob job = new AnalysisJob(
                jobId,
                snapshot.getIncidentId(),
                snapshot,
                JobStatus.QUEUED,
                null,
                null,
                Instant.now(),
                null,
                0);
        jobs.put(jobId, job);
        log.info("Created analysis job {} for incident {}", jobId, snapshot.getIncidentId());
        return jobId;
    }

    /**
     * Updates job status to PROCESSING.
     */
    public void markProcessing(UUID jobId) {
        jobs.computeIfPresent(jobId, (id, job) -> {
            log.info("Job {} status changed: {} -> PROCESSING", jobId, job.status());
            return job.withStatus(JobStatus.PROCESSING);
        });
    }

    /**
     * Marks job as COMPLETED with the generated report.
     */
    public void markCompleted(UUID jobId, String markdownReport, int piiEntitiesMasked) {
        jobs.computeIfPresent(jobId, (id, job) -> {
            log.info("Job {} completed successfully for incident {}", jobId, job.incidentId());
            return new AnalysisJob(
                    job.jobId(),
                    job.incidentId(),
                    job.snapshot(),
                    JobStatus.COMPLETED,
                    markdownReport,
                    null,
                    job.createdAt(),
                    Instant.now(),
                    piiEntitiesMasked);
        });
    }

    /**
     * Marks job as FAILED with an error message.
     */
    public void markFailed(UUID jobId, String errorMessage) {
        jobs.computeIfPresent(jobId, (id, job) -> {
            log.error("Job {} failed for incident {}: {}", jobId, job.incidentId(), errorMessage);
            return new AnalysisJob(
                    job.jobId(),
                    job.incidentId(),
                    job.snapshot(),
                    JobStatus.FAILED,
                    null,
                    errorMessage,
                    job.createdAt(),
                    Instant.now(),
                    0);
        });
    }

    /**
     * Retrieves job status and result.
     */
    public Optional<AnalysisResultResponse> getJobResult(UUID jobId) {
        AnalysisJob job = jobs.get(jobId);
        if (job == null) {
            return Optional.empty();
        }

        return Optional.of(AnalysisResultResponse.builder()
                .jobId(job.jobId())
                .incidentId(job.incidentId())
                .status(job.status())
                .markdownReport(job.markdownReport())
                .errorMessage(job.errorMessage())
                .createdAt(job.createdAt())
                .completedAt(job.completedAt())
                .piiEntitiesMasked(job.piiEntitiesMasked())
                .build());
    }

    /**
     * Gets the incident snapshot for a job (used by analysis service).
     */
    public Optional<IncidentSnapshot> getJobSnapshot(UUID jobId) {
        AnalysisJob job = jobs.get(jobId);
        return job != null ? Optional.of(job.snapshot()) : Optional.empty();
    }

    /**
     * Checks if a job exists.
     */
    public boolean jobExists(UUID jobId) {
        return jobs.containsKey(jobId);
    }

    /**
     * Scheduled cleanup of old jobs (runs every hour).
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void cleanupOldJobs() {
        Instant cutoff = Instant.now().minus(retentionHours, ChronoUnit.HOURS);
        int removedCount = 0;

        for (Map.Entry<UUID, AnalysisJob> entry : jobs.entrySet()) {
            AnalysisJob job = entry.getValue();
            // Only remove completed or failed jobs older than retention period
            if ((job.status() == JobStatus.COMPLETED || job.status() == JobStatus.FAILED)
                    && job.createdAt().isBefore(cutoff)) {
                jobs.remove(entry.getKey());
                removedCount++;
            }
        }

        if (removedCount > 0) {
            log.info("Cleanup: Removed {} old jobs (retention: {} hours)", removedCount, retentionHours);
        }
    }

    /**
     * Returns current job count (for monitoring/health checks).
     */
    public int getActiveJobCount() {
        return (int) jobs.values().stream()
                .filter(job -> job.status() == JobStatus.QUEUED || job.status() == JobStatus.PROCESSING)
                .count();
    }

    public int getTotalJobCount() {
        return jobs.size();
    }

    /**
     * Internal record for storing job data.
     */
    private record AnalysisJob(
            UUID jobId,
            UUID incidentId,
            IncidentSnapshot snapshot,
            JobStatus status,
            String markdownReport,
            String errorMessage,
            Instant createdAt,
            Instant completedAt,
            int piiEntitiesMasked) {
        AnalysisJob withStatus(JobStatus newStatus) {
            return new AnalysisJob(
                    jobId, incidentId, snapshot, newStatus,
                    markdownReport, errorMessage, createdAt, completedAt, piiEntitiesMasked);
        }
    }
}
