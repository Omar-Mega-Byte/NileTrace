package com.niletrace.analysis.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PiiSanitizerServiceTest {

    private PiiSanitizerService sanitizerService;

    @BeforeEach
    void setUp() {
        sanitizerService = new PiiSanitizerService();
    }

    @Test
    @DisplayName("Should mask email addresses")
    void shouldMaskEmails() {
        String input = "User john.doe@example.com reported an issue. Contact admin@company.org for help.";

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent())
                .contains("[EMAIL_REDACTED]")
                .doesNotContain("john.doe@example.com")
                .doesNotContain("admin@company.org");
        assertThat(result.totalMaskedEntities()).isEqualTo(2);
        assertThat(result.detectedPiiTypes()).contains("EMAIL");
    }

    @Test
    @DisplayName("Should mask IPv4 addresses")
    void shouldMaskIPv4Addresses() {
        String input = "Connection from 192.168.1.100 to server 10.0.0.1 failed.";

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent())
                .contains("[IP_REDACTED]")
                .doesNotContain("192.168.1.100")
                .doesNotContain("10.0.0.1");
        assertThat(result.totalMaskedEntities()).isEqualTo(2);
        assertThat(result.detectedPiiTypes()).contains("IP");
    }

    @Test
    @DisplayName("Should mask phone numbers")
    void shouldMaskPhoneNumbers() {
        String input = "Call 555-123-4567 or (800) 555-0199 for support.";

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent())
                .contains("[PHONE_REDACTED]")
                .doesNotContain("555-123-4567")
                .doesNotContain("(800) 555-0199");
        assertThat(result.detectedPiiTypes()).contains("PHONE");
    }

    @Test
    @DisplayName("Should mask credit card numbers")
    void shouldMaskCreditCardNumbers() {
        String input = "Payment failed for card 4111111111111111 and 5500-0000-0000-0004.";

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent())
                .contains("[CC_REDACTED]")
                .doesNotContain("4111111111111111")
                .doesNotContain("5500-0000-0000-0004");
        assertThat(result.detectedPiiTypes()).contains("CREDIT_CARD");
    }

    @Test
    @DisplayName("Should mask multiple PII types in same content")
    void shouldMaskMultiplePiiTypes() {
        String input = """
                Error log from 192.168.1.1:
                User email: test@example.com
                Phone: 555-123-4567
                Card: 4111111111111111
                """;

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent())
                .contains("[IP_REDACTED]")
                .contains("[EMAIL_REDACTED]")
                .contains("[PHONE_REDACTED]")
                .contains("[CC_REDACTED]");
        assertThat(result.totalMaskedEntities()).isEqualTo(4);
    }

    @Test
    @DisplayName("Should handle empty input")
    void shouldHandleEmptyInput() {
        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize("");

        assertThat(result.sanitizedContent()).isEmpty();
        assertThat(result.totalMaskedEntities()).isZero();
        assertThat(result.detectedPiiTypes()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null input")
    void shouldHandleNullInput() {
        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(null);

        assertThat(result.sanitizedContent()).isEmpty();
        assertThat(result.totalMaskedEntities()).isZero();
    }

    @Test
    @DisplayName("Should not alter content without PII")
    void shouldNotAlterContentWithoutPii() {
        String input = "This is a normal log message with no sensitive data.";

        PiiSanitizerService.SanitizationResult result = sanitizerService.sanitize(input);

        assertThat(result.sanitizedContent()).isEqualTo(input);
        assertThat(result.totalMaskedEntities()).isZero();
        assertThat(result.detectedPiiTypes()).isEmpty();
    }
}
