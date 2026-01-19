package com.niletrace.incident.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.niletrace.incident.model.enums.Severity;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateIncidentRequest {

    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    private String description;

    private Severity severity;

    private OffsetDateTime incidentStartTime;

    // Support both 'logContent' and 'logs' from frontend
    @JsonAlias("logs")
    private String logContent;
}
