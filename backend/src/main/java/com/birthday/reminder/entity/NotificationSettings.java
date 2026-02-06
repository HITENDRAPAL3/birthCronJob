package com.birthday.reminder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * NotificationSettings entity for user notification preferences.
 */
@Entity
@Table(name = "notification_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Comma-separated list of days before birthday to send notifications.
     * Example: "7,3,1" means notify 7 days, 3 days, and 1 day before.
     */
    @Column(name = "notification_days", nullable = false)
    @Builder.Default
    private String notificationDays = "7,3,1";

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private Boolean emailEnabled = true;

    @Column(name = "email_template", length = 2000)
    @Builder.Default
    private String emailTemplate = "Hey! Just a reminder that {friendName}'s birthday is coming up on {birthDate}. They will be turning {age} years old!";

    @Column(name = "notification_time")
    @Builder.Default
    private String notificationTime = "08:00";

    /**
     * Get notification days as a list of integers.
     */
    public List<Integer> getNotificationDaysList() {
        if (notificationDays == null || notificationDays.isEmpty()) {
            return List.of(1);
        }
        return Arrays.stream(notificationDays.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Set notification days from a list of integers.
     */
    public void setNotificationDaysList(List<Integer> days) {
        if (days == null || days.isEmpty()) {
            this.notificationDays = "1";
        } else {
            this.notificationDays = days.stream()
                    .sorted()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }
    }

    /**
     * Check if a specific day is in the notification days list.
     */
    public boolean shouldNotifyOnDay(int daysUntilBirthday) {
        return getNotificationDaysList().contains(daysUntilBirthday);
    }

    /**
     * Create default notification settings for a user.
     */
    public static NotificationSettings createDefault(User user) {
        return NotificationSettings.builder()
                .user(user)
                .notificationDays("7,3,1")
                .emailEnabled(true)
                .emailTemplate("Hey! Just a reminder that {friendName}'s birthday is coming up on {birthDate}. They will be turning {age} years old!")
                .notificationTime("08:00")
                .build();
    }
}
