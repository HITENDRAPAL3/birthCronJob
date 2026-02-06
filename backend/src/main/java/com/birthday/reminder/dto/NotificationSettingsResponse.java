package com.birthday.reminder.dto;

import com.birthday.reminder.entity.NotificationSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for notification settings response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingsResponse {

    private Long id;
    private List<Integer> notificationDays;
    private Boolean emailEnabled;
    private String emailTemplate;
    private String notificationTime;

    /**
     * Convert NotificationSettings entity to response DTO.
     */
    public static NotificationSettingsResponse fromEntity(NotificationSettings settings) {
        return NotificationSettingsResponse.builder()
                .id(settings.getId())
                .notificationDays(settings.getNotificationDaysList())
                .emailEnabled(settings.getEmailEnabled())
                .emailTemplate(settings.getEmailTemplate())
                .notificationTime(settings.getNotificationTime())
                .build();
    }
}
