package com.niletrace.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "TestSecretKey123456789TestSecretKey123456789";
    private final long testExpiration = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", testExpiration);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        String email = "test@example.com";
        Long userId = 1L;

        String token = jwtUtil.generateToken(email, userId);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void getEmailFromToken_ShouldReturnCorrectEmail() {
        String email = "test@example.com";
        Long userId = 1L;
        String token = jwtUtil.generateToken(email, userId);

        String extractedEmail = jwtUtil.getEmailFromToken(token);

        assertEquals(email, extractedEmail);
    }

    @Test
    void getUserIdFromToken_ShouldReturnCorrectUserId() {
        String email = "test@example.com";
        Long userId = 42L;
        String token = jwtUtil.generateToken(email, userId);

        Long extractedUserId = jwtUtil.getUserIdFromToken(token);

        assertEquals(userId, extractedUserId);
    }

    @Test
    void validateToken_ShouldReturnTrueForValidToken() {
        String email = "test@example.com";
        Long userId = 1L;
        String token = jwtUtil.generateToken(email, userId);

        boolean isValid = jwtUtil.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalseForInvalidToken() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtUtil.validateToken(invalidToken);

        assertFalse(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalseForEmptyToken() {
        boolean isValid = jwtUtil.validateToken("");

        assertFalse(isValid);
    }
}
