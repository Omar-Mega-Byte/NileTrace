package com.niletrace.incident.dto;

import com.niletrace.incident.model.enums.LogContentType;
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
public class LogResponse {

    private UUID id;
    private UUID incidentId;
    private LogContentType contentType;
    private String originalFilename;
    private OffsetDateTime createdAt;
    // Content not included by default (can be large)
}
