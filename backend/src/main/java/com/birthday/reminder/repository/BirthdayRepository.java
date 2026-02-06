package com.birthday.reminder.repository;

import com.birthday.reminder.entity.Birthday;
import com.birthday.reminder.entity.Category;
import com.birthday.reminder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Birthday entity operations.
 */
@Repository
public interface BirthdayRepository extends JpaRepository<Birthday, Long> {

    /**
     * Find all birthdays for a specific user.
     */
    List<Birthday> findByUserOrderByBirthDateAsc(User user);

    /**
     * Find all birthdays for a user in a specific category.
     */
    List<Birthday> findByUserAndCategoryOrderByBirthDateAsc(User user, Category category);

    /**
     * Find all active birthdays for a user.
     */
    List<Birthday> findByUserAndIsActiveTrueOrderByBirthDateAsc(User user);

    /**
     * Find a specific birthday by ID and user.
     */
    Optional<Birthday> findByIdAndUser(Long id, User user);

    /**
     * Find birthdays by month and day (for notification matching).
     * This query finds birthdays that match a specific month and day regardless of year.
     */
    @Query("SELECT b FROM Birthday b WHERE b.isActive = true " +
           "AND FUNCTION('MONTH', b.birthDate) = :month " +
           "AND FUNCTION('DAY', b.birthDate) = :day")
    List<Birthday> findByMonthAndDay(@Param("month") int month, @Param("day") int day);

    /**
     * Find birthdays for a user that match a specific month and day.
     */
    @Query("SELECT b FROM Birthday b WHERE b.user = :user AND b.isActive = true " +
           "AND FUNCTION('MONTH', b.birthDate) = :month " +
           "AND FUNCTION('DAY', b.birthDate) = :day")
    List<Birthday> findByUserAndMonthAndDay(@Param("user") User user, 
                                             @Param("month") int month, 
                                             @Param("day") int day);

    /**
     * Find all active birthdays for notification processing.
     */
    @Query("SELECT b FROM Birthday b JOIN FETCH b.user u " +
           "JOIN FETCH u.notificationSettings ns " +
           "WHERE b.isActive = true AND ns.emailEnabled = true")
    List<Birthday> findAllActiveWithNotificationsEnabled();

    /**
     * Search birthdays by friend name.
     */
    @Query("SELECT b FROM Birthday b WHERE b.user = :user " +
           "AND LOWER(b.friendName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Birthday> searchByFriendName(@Param("user") User user, @Param("name") String name);

    /**
     * Count birthdays for a user.
     */
    long countByUser(User user);
}
