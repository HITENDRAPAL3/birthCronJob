package com.birthday.reminder.scheduler;

import com.birthday.reminder.entity.Birthday;
import com.birthday.reminder.entity.NotificationSettings;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.repository.BirthdayRepository;
import com.birthday.reminder.repository.NotificationSettingsRepository;
import com.birthday.reminder.repository.UserRepository;
import com.birthday.reminder.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Scheduled task for sending birthday reminder notifications.
 * Supports multiple notification days (e.g., 7 days, 3 days, 1 day before).
 * Runs hourly and checks each user's preferred notification time.
 */
@Component
@ConditionalOnProperty(name = "app.scheduler.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class BirthdayNotificationScheduler {

    private final UserRepository userRepository;
    private final BirthdayRepository birthdayRepository;
    private final NotificationSettingsRepository settingsRepository;
    private final EmailService emailService;

    /**
     * Scheduled task that runs every hour to check and send birthday notifications.
     * Only sends notifications to users whose preferred notification time matches the current hour.
     */
    @Scheduled(cron = "${app.scheduler.cron}")
    @Transactional(readOnly = true)
    public void sendBirthdayNotifications() {
        LocalDateTime now = LocalDateTime.now();
        int currentHour = now.getHour();
        
        log.info("Starting birthday notification check at {} (hour: {})", now, currentHour);
        
        AtomicInteger notificationsSent = new AtomicInteger(0);
        AtomicInteger notificationsFailed = new AtomicInteger(0);
        AtomicInteger usersSkipped = new AtomicInteger(0);

        // Get all users
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            try {
                processUserNotifications(user, currentHour, notificationsSent, notificationsFailed, usersSkipped);
            } catch (Exception e) {
                log.error("Error processing notifications for user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("Birthday notification check completed. Sent: {}, Failed: {}, Users skipped (not their hour): {}", 
                notificationsSent.get(), notificationsFailed.get(), usersSkipped.get());
    }

    /**
     * Process notifications for a single user.
     * Checks if it's the user's preferred notification hour and sends notifications.
     */
    private void processUserNotifications(User user, int currentHour, AtomicInteger sent, AtomicInteger failed, AtomicInteger skipped) {
        // Get user's notification settings
        NotificationSettings settings = settingsRepository.findByUser(user).orElse(null);
        
        if (settings == null || !settings.getEmailEnabled()) {
            log.debug("Notifications disabled for user: {}", user.getEmail());
            return;
        }

        // Check if current hour matches user's preferred notification time
        int userPreferredHour = parseNotificationHour(settings.getNotificationTime());
        if (currentHour != userPreferredHour) {
            skipped.incrementAndGet();
            log.debug("Skipping user {} - not their notification hour (current: {}, preferred: {})", 
                    user.getEmail(), currentHour, userPreferredHour);
            return;
        }
        
        log.info("Processing notifications for user {} at their preferred time: {}", 
                user.getEmail(), settings.getNotificationTime());

        // Get all active birthdays for this user
        List<Birthday> birthdays = birthdayRepository.findByUserAndIsActiveTrueOrderByBirthDateAsc(user);
        
        LocalDate today = LocalDate.now();
        List<Integer> notificationDays = settings.getNotificationDaysList();
        
        for (Birthday birthday : birthdays) {
            long daysUntil = birthday.getDaysUntilBirthday();
            
            // Check if today matches any of the notification days
            if (notificationDays.contains((int) daysUntil)) {
                try {
                    boolean success = emailService.sendBirthdayReminder(user, birthday, settings, (int) daysUntil);
                    if (success) {
                        sent.incrementAndGet();
                        log.info("Notification sent for {}'s birthday ({} days) to {}", 
                                birthday.getFriendName(), daysUntil, user.getEmail());
                    } else {
                        failed.incrementAndGet();
                    }
                } catch (Exception e) {
                    failed.incrementAndGet();
                    log.error("Failed to send notification for {}'s birthday to {}: {}", 
                            birthday.getFriendName(), user.getEmail(), e.getMessage());
                }
            }
        }
    }
    
    /**
     * Parse the notification time string (HH:mm) to get the hour.
     * Returns 8 (8 AM) as default if parsing fails.
     */
    private int parseNotificationHour(String notificationTime) {
        if (notificationTime == null || notificationTime.isEmpty()) {
            return 8; // Default to 8 AM
        }
        try {
            LocalTime time = LocalTime.parse(notificationTime);
            return time.getHour();
        } catch (Exception e) {
            log.warn("Failed to parse notification time '{}', defaulting to 8 AM", notificationTime);
            return 8;
        }
    }

    /**
     * Manual trigger for testing notifications (can be called via an admin endpoint).
     */
    public void triggerManualNotificationCheck() {
        log.info("Manual notification check triggered");
        sendBirthdayNotifications();
    }

    /**
     * Send a test notification to verify email configuration.
     */
    public boolean sendTestNotification(User user) {
        log.info("Sending test notification to user: {}", user.getEmail());
        
        try {
            String subject = "🎂 Birthday Reminder - Test Notification";
            String body = """
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Test Notification</h2>
                    <p>This is a test notification from your Birthday Reminder app.</p>
                    <p>If you received this email, your notification settings are working correctly!</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Birthday Reminder App
                    </p>
                </body>
                </html>
                """;
            
            emailService.sendHtmlEmail(user.getEmail(), subject, body);
            log.info("Test notification sent successfully to {}", user.getEmail());
            return true;
        } catch (Exception e) {
            log.error("Failed to send test notification to {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }
}
