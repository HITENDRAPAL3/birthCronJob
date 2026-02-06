package com.birthday.reminder.service;

import com.birthday.reminder.dto.NotificationSettingsRequest;
import com.birthday.reminder.dto.NotificationSettingsResponse;
import com.birthday.reminder.entity.NotificationSettings;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.exception.BadRequestException;
import com.birthday.reminder.repository.NotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for notification settings operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingsService {

    private final NotificationSettingsRepository settingsRepository;

    /**
     * Get notification settings for a user.
     * Creates default settings if none exist.
     */
    @Transactional
    public NotificationSettingsResponse getSettings(User user) {
        log.debug("Fetching notification settings for user: {}", user.getEmail());
        
        NotificationSettings settings = settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("Creating default notification settings for user: {}", user.getEmail());
                    NotificationSettings defaultSettings = NotificationSettings.createDefault(user);
                    return settingsRepository.save(defaultSettings);
                });

        return NotificationSettingsResponse.fromEntity(settings);
    }

    /**
     * Update notification settings for a user.
     */
    @Transactional
    public NotificationSettingsResponse updateSettings(NotificationSettingsRequest request, User user) {
        log.debug("Updating notification settings for user: {}", user.getEmail());

        NotificationSettings settings = settingsRepository.findByUser(user)
                .orElseGet(() -> NotificationSettings.createDefault(user));

        // Update notification days
        if (request.getNotificationDays() != null) {
            // Validate days are within range (0-30)
            for (Integer day : request.getNotificationDays()) {
                if (day < 0 || day > 30) {
                    throw new BadRequestException("Notification days must be between 0 and 30");
                }
            }
            settings.setNotificationDaysList(request.getNotificationDays());
        }

        if (request.getEmailEnabled() != null) {
            settings.setEmailEnabled(request.getEmailEnabled());
        }
        if (request.getEmailTemplate() != null) {
            settings.setEmailTemplate(request.getEmailTemplate());
        }
        if (request.getNotificationTime() != null) {
            settings.setNotificationTime(request.getNotificationTime());
        }

        NotificationSettings updatedSettings = settingsRepository.save(settings);
        log.info("Notification settings updated for user: {}", user.getEmail());

        return NotificationSettingsResponse.fromEntity(updatedSettings);
    }
}
