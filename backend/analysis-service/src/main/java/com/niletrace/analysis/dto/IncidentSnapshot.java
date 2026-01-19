package com.niletrace.analysis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Full incident snapshot sent from incident-service for analysis.
 * This is the contract between incident-service and analysis-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentSnapshot {

    @NotNull(message = "Incident ID is required")
    private UUID incidentId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Severity is required")
    private String severity; // Accepts String from incident-service (e.g., "SEV1", "SEV2")

    @NotBlank(message = "Log content is required")
    private String logContent;

    @NotNull(message = "Incident start time is required")
    private Instant incidentStartTime;

    @NotNull(message = "Created at timestamp is required")
    private Instant createdAt;

    // Optional fields (strongly recommended for better RCA quality)
    private String serviceName;
    private String environment; // production, staging, dev
    private String region;

    // Convenience method to get Severity enum if needed
    public Severity getSeverityEnum() {
        try {
            return severity != null ? Severity.valueOf(severity) : null;
        } catch (IllegalArgumentException e) {
            return Severity.SEV3; // Default to medium severity
        }
    }
}
