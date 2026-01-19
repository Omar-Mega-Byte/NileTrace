package com.niletrace.auth.config;

import com.niletrace.auth.model.User;
import com.niletrace.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Initializes the database with a default test user for development.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if any users exist
        if (userRepository.count() == 0) {
            // Create default test user
            User testUser = new User();
            testUser.setEmail("test@niletrace.com");
            testUser.setFullName("Test User");
            testUser.setPassword(passwordEncoder.encode("password123"));
            testUser.setCreatedAt(LocalDateTime.now());
            testUser.setUpdatedAt(LocalDateTime.now());

            userRepository.save(testUser);

            log.info("========================================");
            log.info("  Default test user created:");
            log.info("  Email: test@niletrace.com");
            log.info("  Password: password123");
            log.info("========================================");
        }
    }
}
