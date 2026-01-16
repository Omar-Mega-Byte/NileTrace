package com.niletrace.incident.service;

import com.niletrace.incident.dto.*;
import com.niletrace.incident.model.Incident;
import com.niletrace.incident.model.IncidentReport;
import com.niletrace.incident.model.enums.IncidentStatus;
import com.niletrace.incident.repository.IncidentReportRepository;
import com.niletrace.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentReportRepository reportRepository;
    private final LogStorageService logStorageService;
    private final AnalysisServiceClient analysisClient;

    /**
     * Create a new incident
     */
    @Transactional
    public IncidentResponse createIncident(CreateIncidentRequest request, UUID ownerId) {
        log.info("Creating incident for owner: {}", ownerId);

        Incident incident = Incident.builder()
                .ownerId(ownerId)
                .title(request.getTitle())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .incidentStartTime(request.getIncidentStartTime())
                .status(IncidentStatus.OPEN)
                .build();

        incident = incidentRepository.save(incident);

        // Store log content if provided
        if (request.getLogContent() != null && !request.getLogContent().isBlank()) {
            logStorageService.storeTextLog(incident.getId(), request.getLogContent());
        }

        return mapToResponse(incident);
    }

    /**
     * Get all incidents for a user
     */
    public List<IncidentResponse> getUserIncidents(UUID ownerId) {
        return incidentRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific incident by ID
     */
    public IncidentResponse getIncident(UUID incidentId, UUID ownerId) {
        Incident incident = incidentRepository.findByIdAndOwnerId(incidentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        return mapToResponse(incident);
    }

    /**
     * Trigger analysis for an incident
     */
    @Transactional
    public IncidentResponse triggerAnalysis(UUID incidentId, UUID ownerId) {
        log.info("Triggering analysis for incident: {}", incidentId);

        Incident incident = incidentRepository.findByIdAndOwnerId(incidentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        // Check if already analyzed
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new RuntimeException("Incident already analyzed");
        }

        // Update status to ANALYZING
        incident.setStatus(IncidentStatus.ANALYZING);
        incidentRepository.save(incident);

        try {
            // Get combined log content
            String logContent = logStorageService.getCombinedLogContent(incidentId);

            // Build analysis request
            AnalysisRequest analysisRequest = AnalysisRequest.builder()
                    .incidentTitle(incident.getTitle())
                    .incidentDescription(incident.getDescription())
                    .severity(incident.getSeverity().name())
                    .logContent(logContent)
                    .build();

            // Call analysis service
            AnalysisResponse analysisResponse = analysisClient.analyzeIncident(analysisRequest);

            // Save report
            IncidentReport report = IncidentReport.builder()
                    .incidentId(incidentId)
                    .rootCauseAnalysis(analysisResponse.getRootCauseAnalysis())
                    .impactSummary(analysisResponse.getImpactSummary())
                    .actionItems(analysisResponse.getActionItems())
                    .preventionChecklist(analysisResponse.getPreventionChecklist())
                    .modelVersion(analysisResponse.getModelVersion())
                    .build();

            reportRepository.save(report);

            // Update status to RESOLVED
            incident.setStatus(IncidentStatus.RESOLVED);
            incidentRepository.save(incident);

            log.info("Analysis completed for incident: {}", incidentId);

        } catch (Exception e) {
            log.error("Analysis failed for incident: {}, error: {}", incidentId, e.getMessage());
            incident.setStatus(IncidentStatus.FAILED);
            incidentRepository.save(incident);
            throw new RuntimeException("Analysis failed: " + e.getMessage());
        }

        return mapToResponse(incident);
    }

    /**
     * Delete an incident
     */
    @Transactional
    public void deleteIncident(UUID incidentId, UUID ownerId) {
        Incident incident = incidentRepository.findByIdAndOwnerId(incidentId, ownerId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        // Delete associated logs
        logStorageService.deleteLogsForIncident(incidentId);

        // Delete associated report
        reportRepository.findByIncidentId(incidentId)
                .ifPresent(reportRepository::delete);

        // Delete incident
        incidentRepository.delete(incident);
    }

    /**
     * Map Incident entity to response DTO
     */
    private IncidentResponse mapToResponse(Incident incident) {
        IncidentResponse response = IncidentResponse.builder()
                .id(incident.getId())
                .ownerId(incident.getOwnerId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .severity(incident.getSeverity())
                .incidentStartTime(incident.getIncidentStartTime())
                .status(incident.getStatus())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .build();

        // Include report if exists
        reportRepository.findByIncidentId(incident.getId())
                .ifPresent(report -> response.setReport(mapReportToResponse(report)));

        return response;
    }

    private ReportResponse mapReportToResponse(IncidentReport report) {
        return ReportResponse.builder()
                .id(report.getId())
                .incidentId(report.getIncidentId())
                .rootCauseAnalysis(report.getRootCauseAnalysis())
                .impactSummary(report.getImpactSummary())
                .actionItems(report.getActionItems())
                .preventionChecklist(report.getPreventionChecklist())
                .generatedAt(report.getGeneratedAt())
                .modelVersion(report.getModelVersion())
                .build();
    }
}
