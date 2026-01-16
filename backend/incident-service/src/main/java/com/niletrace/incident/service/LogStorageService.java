package com.niletrace.incident.service;

import com.niletrace.incident.model.IncidentLog;
import com.niletrace.incident.model.enums.LogContentType;
import com.niletrace.incident.repository.IncidentLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogStorageService {

    private final IncidentLogRepository logRepository;

    /**
     * Store plain text log content
     */
    @Transactional
    public IncidentLog storeTextLog(UUID incidentId, String content) {
        log.info("Storing text log for incident: {}", incidentId);

        IncidentLog logEntry = IncidentLog.builder()
                .incidentId(incidentId)
                .content(content)
                .contentType(LogContentType.TEXT)
                .build();

        return logRepository.save(logEntry);
    }

    /**
     * Store uploaded file log content
     */
    @Transactional
    public IncidentLog storeFileLog(UUID incidentId, MultipartFile file) throws IOException {
        log.info("Storing file log for incident: {}, filename: {}", incidentId, file.getOriginalFilename());

        // Read file content as text (MVP: stored as TEXT)
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);

        IncidentLog logEntry = IncidentLog.builder()
                .incidentId(incidentId)
                .content(content)
                .contentType(LogContentType.FILE)
                .originalFilename(file.getOriginalFilename())
                .build();

        return logRepository.save(logEntry);
    }

    /**
     * Get all logs for an incident
     */
    public List<IncidentLog> getLogsForIncident(UUID incidentId) {
        return logRepository.findByIncidentId(incidentId);
    }

    /**
     * Combine all log content for analysis
     */
    public String getCombinedLogContent(UUID incidentId) {
        List<IncidentLog> logs = logRepository.findByIncidentId(incidentId);

        if (logs.isEmpty()) {
            return "";
        }

        StringBuilder combined = new StringBuilder();
        for (IncidentLog logEntry : logs) {
            if (logEntry.getOriginalFilename() != null) {
                combined.append("=== File: ").append(logEntry.getOriginalFilename()).append(" ===\n");
            }
            combined.append(logEntry.getContent()).append("\n\n");
        }

        return combined.toString();
    }

    /**
     * Delete all logs for an incident
     */
    @Transactional
    public void deleteLogsForIncident(UUID incidentId) {
        logRepository.deleteByIncidentId(incidentId);
    }
}
