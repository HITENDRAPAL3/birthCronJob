package com.birthday.reminder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Birthday Reminder Application
 * A full-stack application for managing friend birthdays with email notifications.
 */
@SpringBootApplication
@EnableScheduling
public class BirthdayReminderApplication {

    public static void main(String[] args) {
        SpringApplication.run(BirthdayReminderApplication.class, args);
    }
}
