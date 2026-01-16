package com.niletrace.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.niletrace.incident.dto.CreateIncidentRequest;
import com.niletrace.incident.dto.IncidentResponse;
import com.niletrace.incident.dto.MessageResponse;
import com.niletrace.incident.model.enums.IncidentStatus;
import com.niletrace.incident.model.enums.Severity;
import com.niletrace.incident.security.AuthenticatedUser;
import com.niletrace.incident.service.IncidentService;
import com.niletrace.incident.service.LogStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentController.class)
@AutoConfigureMockMvc(addFilters = false)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @MockBean
    private IncidentService incidentService;

    @MockBean
    private LogStorageService logStorageService;

    private UUID userId;
    private UUID incidentId;
    private AuthenticatedUser authenticatedUser;
    private CreateIncidentRequest createRequest;
    private IncidentResponse incidentResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        userId = UUID.randomUUID();
        incidentId = UUID.randomUUID();
        authenticatedUser = new AuthenticatedUser(userId, "test@example.com");

        createRequest = CreateIncidentRequest.builder()
                .title("Production Outage")
                .description("Server is down")
                .severity(Severity.SEV1)
                .build();

        incidentResponse = IncidentResponse.builder()
                .id(incidentId)
                .ownerId(userId)
                .title("Production Outage")
                .description("Server is down")
                .severity(Severity.SEV1)
                .status(IncidentStatus.OPEN)
                .createdAt(OffsetDateTime.now())
                .build();

        // Mock security context
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(authenticatedUser);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createIncident_ShouldReturnCreatedIncident() throws Exception {
        when(incidentService.createIncident(any(CreateIncidentRequest.class), any(UUID.class)))
                .thenReturn(incidentResponse);

        mockMvc.perform(post("/api/incidents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
                .requestAttr("org.springframework.security.core.Authentication.PRINCIPAL", authenticatedUser))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Production Outage"))
                .andExpect(jsonPath("$.severity").value("SEV1"));
    }

    @Test
    void getUserIncidents_ShouldReturnIncidentList() throws Exception {
        when(incidentService.getUserIncidents(any(UUID.class)))
                .thenReturn(List.of(incidentResponse));

        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Production Outage"));
    }

    @Test
    void getIncident_ShouldReturnIncident() throws Exception {
        when(incidentService.getIncident(eq(incidentId), any(UUID.class)))
                .thenReturn(incidentResponse);

        mockMvc.perform(get("/api/incidents/{id}", incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incidentId.toString()))
                .andExpect(jsonPath("$.title").value("Production Outage"));
    }

    @Test
    void uploadLogFile_ValidFile_ShouldSucceed() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "server.log", "text/plain", "ERROR: Something went wrong".getBytes());

        when(incidentService.getIncident(eq(incidentId), any(UUID.class)))
                .thenReturn(incidentResponse);

        mockMvc.perform(multipart("/api/incidents/{id}/logs", incidentId)
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Log file uploaded successfully"));
    }

    @Test
    void uploadLogFile_InvalidExtension_ShouldFail() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "server.exe", "application/octet-stream", "binary data".getBytes());

        when(incidentService.getIncident(eq(incidentId), any(UUID.class)))
                .thenReturn(incidentResponse);

        mockMvc.perform(multipart("/api/incidents/{id}/logs", incidentId)
                .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only .log, .txt, and .json files are allowed"));
    }

    @Test
    void triggerAnalysis_ShouldReturnUpdatedIncident() throws Exception {
        incidentResponse.setStatus(IncidentStatus.RESOLVED);

        when(incidentService.triggerAnalysis(eq(incidentId), any(UUID.class)))
                .thenReturn(incidentResponse);

        mockMvc.perform(post("/api/incidents/{id}/analyze", incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    void deleteIncident_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(incidentService).deleteIncident(eq(incidentId), any(UUID.class));

        mockMvc.perform(delete("/api/incidents/{id}", incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Incident deleted successfully"));
    }
}
