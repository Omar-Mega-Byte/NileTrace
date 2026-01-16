package com.niletrace.incident.dto;

import com.niletrace.incident.model.enums.IncidentStatus;
import com.niletrace.incident.model.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {

    private UUID id;
    private UUID ownerId;
    private String title;
    private String description;
    private Severity severity;
    private OffsetDateTime incidentStartTime;
    private IncidentStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Associated report (if exists)
    private ReportResponse report;
}
