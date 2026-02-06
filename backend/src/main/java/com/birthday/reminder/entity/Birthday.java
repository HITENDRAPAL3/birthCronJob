package com.birthday.reminder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Birthday entity representing a friend's birthday.
 */
@Entity
@Table(name = "birthdays")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Birthday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "friend_name", nullable = false)
    private String friendName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "friend_email")
    private String friendEmail;

    @Column(length = 500)
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Calculate the age of the friend based on birth date.
     */
    public int calculateAge() {
        return LocalDate.now().getYear() - birthDate.getYear();
    }

    /**
     * Get the upcoming birthday date (this year or next year).
     */
    public LocalDate getUpcomingBirthday() {
        LocalDate today = LocalDate.now();
        LocalDate thisYearBirthday = birthDate.withYear(today.getYear());
        
        if (thisYearBirthday.isBefore(today)) {
            return thisYearBirthday.plusYears(1);
        }
        return thisYearBirthday;
    }

    /**
     * Calculate days until the next birthday.
     */
    public long getDaysUntilBirthday() {
        LocalDate today = LocalDate.now();
        LocalDate upcomingBirthday = getUpcomingBirthday();
        return java.time.temporal.ChronoUnit.DAYS.between(today, upcomingBirthday);
    }
}
