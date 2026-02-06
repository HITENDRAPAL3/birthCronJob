package com.birthday.reminder.service;

import com.birthday.reminder.entity.Birthday;
import com.birthday.reminder.entity.NotificationSettings;
import com.birthday.reminder.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

/**
 * Service for sending email notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.application.name}")
    private String appName;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    /**
     * Send birthday reminder email to a user.
     */
    public boolean sendBirthdayReminder(User user, Birthday birthday, NotificationSettings settings) {
        return sendBirthdayReminder(user, birthday, settings, (int) birthday.getDaysUntilBirthday());
    }

    /**
     * Send birthday reminder email with specific days until info.
     */
    public boolean sendBirthdayReminder(User user, Birthday birthday, NotificationSettings settings, int daysUntil) {
        log.debug("Sending birthday reminder to {} for friend {} ({} days)", 
                user.getEmail(), birthday.getFriendName(), daysUntil);

        try {
            String subject = buildSubject(birthday, daysUntil);
            String body = buildEmailBody(birthday, settings, daysUntil);

            sendHtmlEmail(user.getEmail(), subject, body);
            log.info("Birthday reminder sent successfully to {} for {}", user.getEmail(), birthday.getFriendName());
            return true;
        } catch (Exception e) {
            log.error("Failed to send birthday reminder to {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }

    /**
     * Build email subject based on days until birthday.
     */
    private String buildSubject(Birthday birthday, int daysUntil) {
        if (daysUntil == 0) {
            return String.format("🎂 TODAY: %s's birthday!", birthday.getFriendName());
        } else if (daysUntil == 1) {
            return String.format("🎂 TOMORROW: %s's birthday!", birthday.getFriendName());
        } else {
            return String.format("🎂 %d days until %s's birthday!", daysUntil, birthday.getFriendName());
        }
    }

    /**
     * Send a simple text email.
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("Simple email sent successfully to {}", to);
        } catch (MailException e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
            throw e;
        }
    }

    /**
     * Send an HTML email.
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
        log.debug("HTML email sent successfully to {}", to);
    }

    /**
     * Build the email body using the user's template or default template.
     */
    private String buildEmailBody(Birthday birthday, NotificationSettings settings, int daysUntil) {
        String template = settings.getEmailTemplate();
        
        // Replace placeholders in the template
        String body = template
                .replace("{friendName}", birthday.getFriendName())
                .replace("{birthDate}", birthday.getUpcomingBirthday().format(DATE_FORMATTER))
                .replace("{age}", String.valueOf(birthday.calculateAge() + 1))
                .replace("{daysUntil}", String.valueOf(daysUntil));

        // Wrap in HTML template
        return buildHtmlTemplate(birthday.getFriendName(), body, birthday, daysUntil);
    }

    /**
     * Build a beautiful HTML email template.
     */
    private String buildHtmlTemplate(String friendName, String mainMessage, Birthday birthday, int daysUntil) {
        String urgencyColor = daysUntil <= 1 ? "#ef4444" : daysUntil <= 3 ? "#f59e0b" : "#3b82f6";
        String urgencyText = daysUntil == 0 ? "TODAY!" : daysUntil == 1 ? "TOMORROW!" : daysUntil + " days away";
        
        String categoryBadge = "";
        if (birthday.getCategory() != null) {
            categoryBadge = String.format(
                "<span style=\"display: inline-block; padding: 4px 12px; background-color: %s20; color: %s; border-radius: 20px; font-size: 12px; margin-left: 10px;\">%s</span>",
                birthday.getCategory().getColor(),
                birthday.getCategory().getColor(),
                birthday.getCategory().getName()
            );
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Urgency Banner -->
                                <tr>
                                    <td style="padding: 12px 40px; background-color: %s; text-align: center; border-radius: 12px 12px 0 0;">
                                        <span style="color: white; font-weight: bold; font-size: 14px;">⏰ %s</span>
                                    </td>
                                </tr>
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 30px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎂 Birthday Reminder</h1>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">
                                            %s's Birthday!%s
                                        </h2>
                                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                            %s
                                        </p>
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                            <p style="margin: 0; color: #666;">
                                                <strong>📅 Date:</strong> %s<br>
                                                <strong>🎈 Turning:</strong> %d years old<br>
                                                <strong>⏰ In:</strong> %s
                                            </p>
                                        </div>
                                        %s
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                                        <p style="color: #999; font-size: 12px; margin: 0;">
                                            Sent by %s • <a href="#" style="color: #667eea;">Manage Notifications</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
            urgencyColor,
            urgencyText,
            friendName,
            categoryBadge,
            mainMessage,
            birthday.getUpcomingBirthday().format(DATE_FORMATTER),
            birthday.calculateAge() + 1,
            daysUntil == 0 ? "Today!" : daysUntil == 1 ? "Tomorrow" : daysUntil + " days",
            birthday.getNotes() != null && !birthday.getNotes().isEmpty() 
                ? String.format("<p style=\"color: #666; font-style: italic;\">📝 Note: %s</p>", birthday.getNotes())
                : "",
            appName
        );
    }
}
