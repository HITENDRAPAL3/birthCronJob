package com.birthday.reminder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Category entity for grouping birthdays (Family, Work, Friends, etc.).
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 7)
    private String color; // Hex color code like #FF5733

    @Column(length = 50)
    private String icon; // Icon name for frontend

    @OneToMany(mappedBy = "category")
    @Builder.Default
    private List<Birthday> birthdays = new ArrayList<>();

    /**
     * Default categories for a new user.
     */
    public static List<Category> createDefaults(User user) {
        List<Category> defaults = new ArrayList<>();
        defaults.add(Category.builder().user(user).name("Family").color("#ef4444").icon("heart").build());
        defaults.add(Category.builder().user(user).name("Friends").color("#3b82f6").icon("users").build());
        defaults.add(Category.builder().user(user).name("Work").color("#10b981").icon("briefcase").build());
        defaults.add(Category.builder().user(user).name("College").color("#f59e0b").icon("graduation-cap").build());
        return defaults;
    }
}
