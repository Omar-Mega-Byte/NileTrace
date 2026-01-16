package com.niletrace.auth.service;

import com.niletrace.auth.dto.*;
import com.niletrace.auth.model.User;
import com.niletrace.auth.repository.UserRepository;
import com.niletrace.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .fullName("Test User")
                .build();

        signupRequest = SignupRequest.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    void signup_ShouldCreateUserAndReturnAuthResponse() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(anyString(), anyLong())).thenReturn("jwt-token");

        AuthResponse response = authService.signup(signupRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(testUser.getEmail(), response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signup_ShouldThrowExceptionWhenEmailExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.signup(signupRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnAuthResponseForValidCredentials() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong())).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(testUser.getEmail(), response.getEmail());
    }

    @Test
    void login_ShouldThrowExceptionForInvalidEmail() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_ShouldThrowExceptionForInvalidPassword() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    void validateToken_ShouldReturnTrueForValidToken() {
        when(jwtUtil.validateToken(anyString())).thenReturn(true);

        boolean result = authService.validateToken("valid-token");

        assertTrue(result);
    }

    @Test
    void getUserFromToken_ShouldReturnUserResponse() {
        when(jwtUtil.getEmailFromToken(anyString())).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        UserResponse response = authService.getUserFromToken("jwt-token");

        assertNotNull(response);
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getFullName(), response.getFullName());
    }
}
