package com.niletrace.analysis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.niletrace.analysis.dto.AnalysisResultResponse;
import com.niletrace.analysis.dto.IncidentSnapshot;
import com.niletrace.analysis.dto.JobStatus;
import com.niletrace.analysis.dto.Severity;
import com.niletrace.analysis.service.AnalysisService;
import com.niletrace.analysis.service.JobManagerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalysisController.class)
class AnalysisControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private AnalysisService analysisService;

        @MockBean
        private JobManagerService jobManagerService;

        private IncidentSnapshot createValidSnapshot() {
                return IncidentSnapshot.builder()
                                .incidentId(UUID.randomUUID())
                                .title("Database Connection Timeout")
                                .description("Users experiencing intermittent connection failures")
                                .severity("SEV2")
                                .logContent("2024-01-15 10:23:45 ERROR Connection timeout")
                                .incidentStartTime(Instant.now().minusSeconds(3600))
                                .createdAt(Instant.now())
                                .serviceName("user-service")
                                .environment("production")
                                .region("us-east-1")
                                .build();
        }

        @Test
        @DisplayName("POST /api/analysis/jobs should accept valid request")
        void submitJobShouldAcceptValidRequest() throws Exception {
                IncidentSnapshot snapshot = createValidSnapshot();
                UUID jobId = UUID.randomUUID();

                when(analysisService.submitAnalysis(any(IncidentSnapshot.class))).thenReturn(jobId);

                mockMvc.perform(post("/api/analysis/jobs")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(snapshot)))
                                .andExpect(status().isAccepted())
                                .andExpect(jsonPath("$.jobId").value(jobId.toString()))
                                .andExpect(jsonPath("$.status").value("QUEUED"))
                                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("POST /api/analysis/jobs should reject invalid request")
        void submitJobShouldRejectInvalidRequest() throws Exception {
                IncidentSnapshot invalidSnapshot = IncidentSnapshot.builder()
                                .incidentId(null) // Missing required field
                                .title("") // Blank
                                .build();

                mockMvc.perform(post("/api/analysis/jobs")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidSnapshot)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/analysis/jobs/{jobId} should return job result")
        void getJobResultShouldReturnResult() throws Exception {
                UUID jobId = UUID.randomUUID();
                UUID incidentId = UUID.randomUUID();

                AnalysisResultResponse response = AnalysisResultResponse.builder()
                                .jobId(jobId)
                                .incidentId(incidentId)
                                .status(JobStatus.COMPLETED)
                                .markdownReport("# Executive Summary\nTest report")
                                .createdAt(Instant.now())
                                .completedAt(Instant.now())
                                .piiEntitiesMasked(3)
                                .build();

                when(jobManagerService.getJobResult(jobId)).thenReturn(Optional.of(response));

                mockMvc.perform(get("/api/analysis/jobs/{jobId}", jobId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.jobId").value(jobId.toString()))
                                .andExpect(jsonPath("$.incidentId").value(incidentId.toString()))
                                .andExpect(jsonPath("$.status").value("COMPLETED"))
                                .andExpect(jsonPath("$.markdownReport").exists())
                                .andExpect(jsonPath("$.piiEntitiesMasked").value(3));
        }

        @Test
        @DisplayName("GET /api/analysis/jobs/{jobId} should return 404 for unknown job")
        void getJobResultShouldReturn404ForUnknownJob() throws Exception {
                UUID unknownJobId = UUID.randomUUID();

                when(jobManagerService.getJobResult(unknownJobId)).thenReturn(Optional.empty());

                mockMvc.perform(get("/api/analysis/jobs/{jobId}", unknownJobId))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/analysis/health should return health status")
        void healthCheckShouldReturnStatus() throws Exception {
                when(jobManagerService.getActiveJobCount()).thenReturn(2);
                when(jobManagerService.getTotalJobCount()).thenReturn(10);

                mockMvc.perform(get("/api/analysis/health"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("UP"))
                                .andExpect(jsonPath("$.activeJobs").value(2))
                                .andExpect(jsonPath("$.totalJobs").value(10));
        }
}
