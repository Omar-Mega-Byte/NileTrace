package com.niletrace.incident.security;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthenticatedUser {

    private UUID userId;
    private String email;
}
