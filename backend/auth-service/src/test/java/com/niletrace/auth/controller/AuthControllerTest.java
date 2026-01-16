package com.niletrace.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.niletrace.auth.dto.*;
import com.niletrace.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        signupRequest = SignupRequest.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        authResponse = AuthResponse.builder()
                .token("jwt-token")
                .userId(1L)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        userResponse = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .build();
    }

    @Test
    void signup_ShouldReturnCreatedStatus() throws Exception {
        when(authService.signup(any(SignupRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void login_ShouldReturnOkStatus() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void validateToken_ShouldReturnOkForValidToken() throws Exception {
        when(authService.validateToken(anyString())).thenReturn(true);

        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Token is valid"));
    }

    @Test
    void validateToken_ShouldReturnUnauthorizedForInvalidToken() throws Exception {
        when(authService.validateToken(anyString())).thenReturn(false);

        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Token is invalid"));
    }

    @Test
    void getCurrentUser_ShouldReturnUserResponse() throws Exception {
        when(authService.getUserFromToken(anyString())).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"));
    }

    @Test
    void logout_ShouldReturnSuccessMessage() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}
