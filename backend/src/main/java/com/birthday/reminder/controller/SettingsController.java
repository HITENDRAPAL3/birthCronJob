package com.birthday.reminder.controller;

import com.birthday.reminder.dto.ApiResponse;
import com.birthday.reminder.dto.NotificationSettingsRequest;
import com.birthday.reminder.dto.NotificationSettingsResponse;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.service.NotificationSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for notification settings.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Slf4j
public class SettingsController {

    private final NotificationSettingsService settingsService;

    /**
     * Get notification settings for the authenticated user.
     * GET /api/settings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> getSettings(
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/settings for user: {}", user.getEmail());
        NotificationSettingsResponse settings = settingsService.getSettings(user);
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    /**
     * Update notification settings for the authenticated user.
     * PUT /api/settings
     */
    @PutMapping
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> updateSettings(
            @Valid @RequestBody NotificationSettingsRequest request,
            @AuthenticationPrincipal User user
    ) {
        log.debug("PUT /api/settings for user: {}", user.getEmail());
        NotificationSettingsResponse settings = settingsService.updateSettings(request, user);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", settings));
    }
}
