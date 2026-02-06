package com.birthday.reminder.repository;

import com.birthday.reminder.entity.NotificationSettings;
import com.birthday.reminder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for NotificationSettings entity operations.
 */
@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {

    /**
     * Find notification settings for a specific user.
     */
    Optional<NotificationSettings> findByUser(User user);

    /**
     * Check if settings exist for a user.
     */
    boolean existsByUser(User user);
}
