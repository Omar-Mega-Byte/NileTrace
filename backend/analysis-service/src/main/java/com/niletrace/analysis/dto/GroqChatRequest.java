package com.niletrace.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body for Groq Chat Completions API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroqChatRequest {
    private String model;
    private List<Message> messages;
    private double temperature;
    private int max_tokens;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
