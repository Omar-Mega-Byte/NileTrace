package com.niletrace.analysis.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PII Sanitizer service for scrubbing sensitive information from log content.
 * Masks: Email addresses, IP addresses, Phone numbers, Credit card numbers.
 */
@Service
@Slf4j
public class PiiSanitizerService {

    // Email pattern: matches standard email formats
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            Pattern.CASE_INSENSITIVE);

    // IPv4 pattern: matches standard IPv4 addresses
    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b");

    // IPv6 pattern: matches standard IPv6 addresses (simplified)
    private static final Pattern IPV6_PATTERN = Pattern.compile(
            "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,7}:|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|" +
                    "(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|" +
                    "[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|" +
                    ":(?::[0-9a-fA-F]{1,4}){1,7}|" +
                    "::(?:[fF]{4}:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)");

    // Phone number patterns: matches various phone formats
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+?1[-.\\s]?)?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}|" + // US format with optional spaces
                    "\\+?[0-9]{1,4}[-.\\s]?[0-9]{6,12}|" + // International format
                    "\\b[0-9]{3}[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}\\b" // Simple format
    );

    // Credit card pattern: matches common credit card formats (with or without
    // separators)
    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile(
            "\\b(?:4[0-9]{12}(?:[0-9]{3})?|" + // Visa
                    "5[1-5][0-9]{14}|" + // MasterCard
                    "3[47][0-9]{13}|" + // American Express
                    "6(?:011|5[0-9]{2})[0-9]{12}|" + // Discover
                    "(?:2131|1800|35\\d{3})\\d{11})\\b|" + // JCB
                    "\\b[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\\b" // Generic with separators
    );

    private static final String EMAIL_REDACTED = "[EMAIL_REDACTED]";
    private static final String IP_REDACTED = "[IP_REDACTED]";
    private static final String PHONE_REDACTED = "[PHONE_REDACTED]";
    private static final String CC_REDACTED = "[CC_REDACTED]";

    /**
     * Sanitizes the input text by masking all detected PII entities.
     *
     * @param content The raw log content to sanitize
     * @return SanitizationResult containing the sanitized text and count of masked
     *         entities
     */
    public SanitizationResult sanitize(String content) {
        if (content == null || content.isBlank()) {
            return new SanitizationResult("", 0, List.of());
        }

        List<String> detectedTypes = new ArrayList<>();
        String sanitized = content;
        int totalMasked = 0;

        // Mask credit cards first (to avoid partial matches with phone numbers)
        int ccCount = countMatches(CREDIT_CARD_PATTERN, sanitized);
        if (ccCount > 0) {
            sanitized = CREDIT_CARD_PATTERN.matcher(sanitized).replaceAll(CC_REDACTED);
            totalMasked += ccCount;
            detectedTypes.add("CREDIT_CARD");
        }

        // Mask emails
        int emailCount = countMatches(EMAIL_PATTERN, sanitized);
        if (emailCount > 0) {
            sanitized = EMAIL_PATTERN.matcher(sanitized).replaceAll(EMAIL_REDACTED);
            totalMasked += emailCount;
            detectedTypes.add("EMAIL");
        }

        // Mask IPv6 first (more specific pattern)
        int ipv6Count = countMatches(IPV6_PATTERN, sanitized);
        if (ipv6Count > 0) {
            sanitized = IPV6_PATTERN.matcher(sanitized).replaceAll(IP_REDACTED);
            totalMasked += ipv6Count;
            if (!detectedTypes.contains("IP")) {
                detectedTypes.add("IP");
            }
        }

        // Mask IPv4
        int ipv4Count = countMatches(IPV4_PATTERN, sanitized);
        if (ipv4Count > 0) {
            sanitized = IPV4_PATTERN.matcher(sanitized).replaceAll(IP_REDACTED);
            totalMasked += ipv4Count;
            if (!detectedTypes.contains("IP")) {
                detectedTypes.add("IP");
            }
        }

        // Mask phone numbers last (to avoid false positives after other masking)
        int phoneCount = countMatches(PHONE_PATTERN, sanitized);
        if (phoneCount > 0) {
            sanitized = PHONE_PATTERN.matcher(sanitized).replaceAll(PHONE_REDACTED);
            totalMasked += phoneCount;
            detectedTypes.add("PHONE");
        }

        // Log the privacy shield message as per architecture spec
        if (totalMasked > 0) {
            log.warn("Privacy Shield Active: Masking {} detected PII entities before external transmission. Types: {}",
                    totalMasked, detectedTypes);
        }

        return new SanitizationResult(sanitized, totalMasked, detectedTypes);
    }

    private int countMatches(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    /**
     * Result of PII sanitization containing the cleaned text and metadata.
     */
    public record SanitizationResult(
            String sanitizedContent,
            int totalMaskedEntities,
            List<String> detectedPiiTypes) {
    }
}
