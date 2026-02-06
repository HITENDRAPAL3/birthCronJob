package com.birthday.reminder.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating notification settings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsRequest {

    /**
     * List of days before birthday to send notifications.
     * Example: [7, 3, 1] means notify 7 days, 3 days, and 1 day before.
     */
    private List<Integer> notificationDays;

    private Boolean emailEnabled;

    @Size(max = 2000, message = "Email template cannot exceed 2000 characters")
    private String emailTemplate;

    private String notificationTime;
}
