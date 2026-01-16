package com.niletrace.incident.service;

import com.niletrace.incident.dto.AnalysisResponse;
import com.niletrace.incident.dto.CreateIncidentRequest;
import com.niletrace.incident.dto.IncidentResponse;
import com.niletrace.incident.model.Incident;
import com.niletrace.incident.model.IncidentReport;
import com.niletrace.incident.model.enums.IncidentStatus;
import com.niletrace.incident.model.enums.Severity;
import com.niletrace.incident.repository.IncidentReportRepository;
import com.niletrace.incident.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentReportRepository reportRepository;

    @Mock
    private LogStorageService logStorageService;

    @Mock
    private AnalysisServiceClient analysisClient;

    @InjectMocks
    private IncidentService incidentService;

    private UUID ownerId;
    private UUID incidentId;
    private Incident testIncident;
    private CreateIncidentRequest createRequest;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        incidentId = UUID.randomUUID();

        testIncident = Incident.builder()
                .id(incidentId)
                .ownerId(ownerId)
                .title("Production Database Outage")
                .description("Database connection pool exhausted")
                .severity(Severity.SEV1)
                .status(IncidentStatus.OPEN)
                .createdAt(OffsetDateTime.now())
                .build();

        createRequest = CreateIncidentRequest.builder()
                .title("Production Database Outage")
                .description("Database connection pool exhausted")
                .severity(Severity.SEV1)
                .build();
    }

    @Test
    void createIncident_ShouldCreateAndReturnIncident() {
        when(incidentRepository.save(any(Incident.class))).thenReturn(testIncident);
        when(reportRepository.findByIncidentId(any())).thenReturn(Optional.empty());

        IncidentResponse response = incidentService.createIncident(createRequest, ownerId);

        assertNotNull(response);
        assertEquals(testIncident.getTitle(), response.getTitle());
        assertEquals(testIncident.getSeverity(), response.getSeverity());
        assertEquals(IncidentStatus.OPEN, response.getStatus());
        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    void createIncident_WithLogContent_ShouldStoreLog() {
        createRequest.setLogContent("ERROR: Connection refused");
        when(incidentRepository.save(any(Incident.class))).thenReturn(testIncident);
        when(reportRepository.findByIncidentId(any())).thenReturn(Optional.empty());

        incidentService.createIncident(createRequest, ownerId);

        verify(logStorageService).storeTextLog(eq(incidentId), eq("ERROR: Connection refused"));
    }

    @Test
    void getUserIncidents_ShouldReturnUserIncidents() {
        when(incidentRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId))
                .thenReturn(List.of(testIncident));
        when(reportRepository.findByIncidentId(any())).thenReturn(Optional.empty());

        List<IncidentResponse> incidents = incidentService.getUserIncidents(ownerId);

        assertEquals(1, incidents.size());
        assertEquals(testIncident.getTitle(), incidents.get(0).getTitle());
    }

    @Test
    void getIncident_ShouldReturnIncidentWithReport() {
        IncidentReport report = IncidentReport.builder()
                .id(UUID.randomUUID())
                .incidentId(incidentId)
                .rootCauseAnalysis("Connection pool misconfigured")
                .impactSummary("100% of users affected")
                .modelVersion("llama-3.1-70b")
                .build();

        when(incidentRepository.findByIdAndOwnerId(incidentId, ownerId))
                .thenReturn(Optional.of(testIncident));
        when(reportRepository.findByIncidentId(incidentId))
                .thenReturn(Optional.of(report));

        IncidentResponse response = incidentService.getIncident(incidentId, ownerId);

        assertNotNull(response);
        assertNotNull(response.getReport());
        assertEquals("Connection pool misconfigured", response.getReport().getRootCauseAnalysis());
    }

    @Test
    void getIncident_NotFound_ShouldThrowException() {
        when(incidentRepository.findByIdAndOwnerId(incidentId, ownerId))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> incidentService.getIncident(incidentId, ownerId));
    }

    @Test
    void triggerAnalysis_ShouldCallAnalysisServiceAndSaveReport() {
        AnalysisResponse analysisResponse = AnalysisResponse.builder()
                .rootCauseAnalysis("Root cause identified")
                .impactSummary("Impact summary here")
                .actionItems("1. Fix connection pool")
                .preventionChecklist("1. Add monitoring")
                .modelVersion("llama-3.1-70b-versatile")
                .build();

        when(incidentRepository.findByIdAndOwnerId(incidentId, ownerId))
                .thenReturn(Optional.of(testIncident));
        when(logStorageService.getCombinedLogContent(incidentId)).thenReturn("ERROR logs here");
        when(analysisClient.analyzeIncident(any())).thenReturn(analysisResponse);
        when(incidentRepository.save(any())).thenReturn(testIncident);
        when(reportRepository.save(any())).thenReturn(null);
        when(reportRepository.findByIncidentId(any())).thenReturn(Optional.empty());

        incidentService.triggerAnalysis(incidentId, ownerId);

        verify(analysisClient).analyzeIncident(any());
        verify(reportRepository).save(any(IncidentReport.class));
        verify(incidentRepository, times(2)).save(any(Incident.class));
    }

    @Test
    void triggerAnalysis_AlreadyResolved_ShouldThrowException() {
        testIncident.setStatus(IncidentStatus.RESOLVED);

        when(incidentRepository.findByIdAndOwnerId(incidentId, ownerId))
                .thenReturn(Optional.of(testIncident));

        assertThrows(RuntimeException.class, () -> incidentService.triggerAnalysis(incidentId, ownerId));
    }

    @Test
    void deleteIncident_ShouldDeleteIncidentAndAssociatedData() {
        when(incidentRepository.findByIdAndOwnerId(incidentId, ownerId))
                .thenReturn(Optional.of(testIncident));
        when(reportRepository.findByIncidentId(incidentId)).thenReturn(Optional.empty());

        incidentService.deleteIncident(incidentId, ownerId);

        verify(logStorageService).deleteLogsForIncident(incidentId);
        verify(incidentRepository).delete(testIncident);
    }
}
