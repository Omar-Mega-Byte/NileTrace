package com.niletrace.analysis.service;

import com.niletrace.analysis.dto.AnalysisResultResponse;
import com.niletrace.analysis.dto.IncidentSnapshot;
import com.niletrace.analysis.dto.JobStatus;
import com.niletrace.analysis.dto.Severity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JobManagerServiceTest {

    private JobManagerService jobManagerService;

    @BeforeEach
    void setUp() {
        jobManagerService = new JobManagerService();
    }

    private IncidentSnapshot createTestSnapshot() {
        return IncidentSnapshot.builder()
                .incidentId(UUID.randomUUID())
                .title("Test Incident")
                .description("Test description")
                .severity("SEV2")
                .logContent("Sample log content")
                .incidentStartTime(Instant.now().minusSeconds(3600))
                .createdAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should create job with QUEUED status")
    void shouldCreateJobWithQueuedStatus() {
        IncidentSnapshot snapshot = createTestSnapshot();

        UUID jobId = jobManagerService.createJob(snapshot);

        assertThat(jobId).isNotNull();

        Optional<AnalysisResultResponse> result = jobManagerService.getJobResult(jobId);
        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(JobStatus.QUEUED);
        assertThat(result.get().getIncidentId()).isEqualTo(snapshot.getIncidentId());
    }

    @Test
    @DisplayName("Should transition job to PROCESSING status")
    void shouldTransitionToProcessing() {
        IncidentSnapshot snapshot = createTestSnapshot();
        UUID jobId = jobManagerService.createJob(snapshot);

        jobManagerService.markProcessing(jobId);

        Optional<AnalysisResultResponse> result = jobManagerService.getJobResult(jobId);
        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(JobStatus.PROCESSING);
    }

    @Test
    @DisplayName("Should mark job as COMPLETED with report")
    void shouldMarkAsCompleted() {
        IncidentSnapshot snapshot = createTestSnapshot();
        UUID jobId = jobManagerService.createJob(snapshot);
        String report = "# Test Report\nContent here.";

        jobManagerService.markProcessing(jobId);
        jobManagerService.markCompleted(jobId, report, 5);

        Optional<AnalysisResultResponse> result = jobManagerService.getJobResult(jobId);
        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(JobStatus.COMPLETED);
        assertThat(result.get().getMarkdownReport()).isEqualTo(report);
        assertThat(result.get().getPiiEntitiesMasked()).isEqualTo(5);
        assertThat(result.get().getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should mark job as FAILED with error message")
    void shouldMarkAsFailed() {
        IncidentSnapshot snapshot = createTestSnapshot();
        UUID jobId = jobManagerService.createJob(snapshot);
        String errorMessage = "API timeout";

        jobManagerService.markProcessing(jobId);
        jobManagerService.markFailed(jobId, errorMessage);

        Optional<AnalysisResultResponse> result = jobManagerService.getJobResult(jobId);
        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(JobStatus.FAILED);
        assertThat(result.get().getErrorMessage()).isEqualTo(errorMessage);
        assertThat(result.get().getMarkdownReport()).isNull();
    }

    @Test
    @DisplayName("Should return empty for non-existent job")
    void shouldReturnEmptyForNonExistentJob() {
        UUID nonExistentId = UUID.randomUUID();

        Optional<AnalysisResultResponse> result = jobManagerService.getJobResult(nonExistentId);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should track active job count")
    void shouldTrackActiveJobCount() {
        IncidentSnapshot snapshot1 = createTestSnapshot();
        IncidentSnapshot snapshot2 = createTestSnapshot();

        UUID jobId1 = jobManagerService.createJob(snapshot1);
        UUID jobId2 = jobManagerService.createJob(snapshot2);

        assertThat(jobManagerService.getActiveJobCount()).isEqualTo(2);
        assertThat(jobManagerService.getTotalJobCount()).isEqualTo(2);

        jobManagerService.markProcessing(jobId1);
        jobManagerService.markCompleted(jobId1, "Report", 0);

        assertThat(jobManagerService.getActiveJobCount()).isEqualTo(1);
        assertThat(jobManagerService.getTotalJobCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should check job existence")
    void shouldCheckJobExistence() {
        IncidentSnapshot snapshot = createTestSnapshot();
        UUID jobId = jobManagerService.createJob(snapshot);

        assertThat(jobManagerService.jobExists(jobId)).isTrue();
        assertThat(jobManagerService.jobExists(UUID.randomUUID())).isFalse();
    }

    @Test
    @DisplayName("Should retrieve job snapshot")
    void shouldRetrieveJobSnapshot() {
        IncidentSnapshot snapshot = createTestSnapshot();
        UUID jobId = jobManagerService.createJob(snapshot);

        Optional<IncidentSnapshot> retrieved = jobManagerService.getJobSnapshot(jobId);

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getIncidentId()).isEqualTo(snapshot.getIncidentId());
        assertThat(retrieved.get().getTitle()).isEqualTo(snapshot.getTitle());
    }
}
