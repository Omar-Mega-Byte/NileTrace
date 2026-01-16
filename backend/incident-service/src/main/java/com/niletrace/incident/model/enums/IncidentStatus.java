package com.niletrace.incident.model.enums;

public enum IncidentStatus {
    OPEN, // Incident created, waiting for analysis
    ANALYZING, // Analysis in progress
    RESOLVED, // Analysis complete, report generated
    FAILED // Analysis failed
}
