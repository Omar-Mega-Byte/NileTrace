package com.niletrace.analysis.dto;

/**
 * Job status enum for tracking analysis job lifecycle.
 */
public enum JobStatus {
    QUEUED, // Job accepted, not started
    PROCESSING, // LLM analysis in progress
    COMPLETED, // Report ready
    FAILED // Permanent failure
}
