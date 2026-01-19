package com.niletrace.analysis.dto;

/**
 * Severity levels for incidents following industry standard (PagerDuty,
 * OpsGenie style).
 */
public enum Severity {
    SEV1, // Critical outage
    SEV2, // Major degradation
    SEV3, // Partial impact
    SEV4, // Minor issue
    SEV5 // Informational
}
