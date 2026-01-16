package com.niletrace.incident.controller;

import com.niletrace.incident.dto.*;
import com.niletrace.incident.security.AuthenticatedUser;
import com.niletrace.incident.service.IncidentService;
import com.niletrace.incident.service.LogStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;
    private final LogStorageService logStorageService;

    /**
     * Create a new incident with optional text log content
     */
    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody CreateIncidentRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {

        IncidentResponse response = incidentService.createIncident(request, user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all incidents for authenticated user
     */
    @GetMapping
    public ResponseEntity<List<IncidentResponse>> getUserIncidents(
            @AuthenticationPrincipal AuthenticatedUser user) {

        List<IncidentResponse> incidents = incidentService.getUserIncidents(user.getUserId());
        return ResponseEntity.ok(incidents);
    }

    /**
     * Get a specific incident by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncident(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {

        IncidentResponse response = incidentService.getIncident(id, user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * Upload log file for an incident
     */
    @PostMapping(value = "/{id}/logs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> uploadLogFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser user) throws IOException {

        // Verify ownership
        incidentService.getIncident(id, user.getUserId());

        // Validate file type
        String filename = file.getOriginalFilename();
        if (filename == null ||
                !(filename.endsWith(".log") || filename.endsWith(".txt") || filename.endsWith(".json"))) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Only .log, .txt, and .json files are allowed"));
        }

        logStorageService.storeFileLog(id, file);

        return ResponseEntity.ok(new MessageResponse("Log file uploaded successfully"));
    }

    /**
     * Add text log content to an incident
     */
    @PostMapping("/{id}/logs/text")
    public ResponseEntity<MessageResponse> addTextLog(
            @PathVariable UUID id,
            @RequestBody String logContent,
            @AuthenticationPrincipal AuthenticatedUser user) {

        // Verify ownership
        incidentService.getIncident(id, user.getUserId());

        logStorageService.storeTextLog(id, logContent);

        return ResponseEntity.ok(new MessageResponse("Log content added successfully"));
    }

    /**
     * Trigger AI analysis for an incident
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<IncidentResponse> triggerAnalysis(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {

        IncidentResponse response = incidentService.triggerAnalysis(id, user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an incident
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteIncident(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {

        incidentService.deleteIncident(id, user.getUserId());
        return ResponseEntity.ok(new MessageResponse("Incident deleted successfully"));
    }
}
