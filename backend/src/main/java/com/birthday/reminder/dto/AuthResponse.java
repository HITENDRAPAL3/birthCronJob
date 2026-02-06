package com.birthday.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response containing JWT token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type;
    private Long userId;
    private String email;
    private String name;
    private long expiresIn;

    public static AuthResponse of(String token, Long userId, String email, String name, long expiresIn) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(userId)
                .email(email)
                .name(name)
                .expiresIn(expiresIn)
                .build();
    }
}
