package com.niletrace.incident.service;

import com.niletrace.incident.model.IncidentLog;
import com.niletrace.incident.model.enums.LogContentType;
import com.niletrace.incident.repository.IncidentLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogStorageServiceTest {

    @Mock
    private IncidentLogRepository logRepository;

    @InjectMocks
    private LogStorageService logStorageService;

    private UUID incidentId;

    @BeforeEach
    void setUp() {
        incidentId = UUID.randomUUID();
    }

    @Test
    void storeTextLog_ShouldSaveLogWithTextType() {
        String content = "ERROR: Connection refused at 10.0.0.1:5432";

        IncidentLog savedLog = IncidentLog.builder()
                .id(UUID.randomUUID())
                .incidentId(incidentId)
                .content(content)
                .contentType(LogContentType.TEXT)
                .build();

        when(logRepository.save(any(IncidentLog.class))).thenReturn(savedLog);

        IncidentLog result = logStorageService.storeTextLog(incidentId, content);

        assertNotNull(result);
        assertEquals(LogContentType.TEXT, result.getContentType());

        ArgumentCaptor<IncidentLog> captor = ArgumentCaptor.forClass(IncidentLog.class);
        verify(logRepository).save(captor.capture());
        assertEquals(content, captor.getValue().getContent());
    }

    @Test
    void storeFileLog_ShouldSaveLogWithFileType() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "server.log", "text/plain",
                "2026-01-16 10:00:00 ERROR Database timeout".getBytes());

        IncidentLog savedLog = IncidentLog.builder()
                .id(UUID.randomUUID())
                .incidentId(incidentId)
                .content("2026-01-16 10:00:00 ERROR Database timeout")
                .contentType(LogContentType.FILE)
                .originalFilename("server.log")
                .build();

        when(logRepository.save(any(IncidentLog.class))).thenReturn(savedLog);

        IncidentLog result = logStorageService.storeFileLog(incidentId, file);

        assertNotNull(result);
        assertEquals(LogContentType.FILE, result.getContentType());
        assertEquals("server.log", result.getOriginalFilename());
    }

    @Test
    void getCombinedLogContent_ShouldCombineAllLogs() {
        IncidentLog log1 = IncidentLog.builder()
                .content("Log content 1")
                .contentType(LogContentType.TEXT)
                .build();

        IncidentLog log2 = IncidentLog.builder()
                .content("Log content 2")
                .contentType(LogContentType.FILE)
                .originalFilename("app.log")
                .build();

        when(logRepository.findByIncidentId(incidentId)).thenReturn(List.of(log1, log2));

        String combined = logStorageService.getCombinedLogContent(incidentId);

        assertTrue(combined.contains("Log content 1"));
        assertTrue(combined.contains("Log content 2"));
        assertTrue(combined.contains("=== File: app.log ==="));
    }

    @Test
    void getCombinedLogContent_EmptyLogs_ShouldReturnEmpty() {
        when(logRepository.findByIncidentId(incidentId)).thenReturn(List.of());

        String combined = logStorageService.getCombinedLogContent(incidentId);

        assertEquals("", combined);
    }

    @Test
    void deleteLogsForIncident_ShouldDeleteAllLogs() {
        logStorageService.deleteLogsForIncident(incidentId);

        verify(logRepository).deleteByIncidentId(incidentId);
    }
}
