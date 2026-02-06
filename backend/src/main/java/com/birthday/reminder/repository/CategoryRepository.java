package com.birthday.reminder.repository;

import com.birthday.reminder.entity.Category;
import com.birthday.reminder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Category entity operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find all categories for a user.
     */
    List<Category> findByUserOrderByNameAsc(User user);

    /**
     * Find category by ID and user.
     */
    Optional<Category> findByIdAndUser(Long id, User user);

    /**
     * Check if category exists for user with given name.
     */
    boolean existsByUserAndNameIgnoreCase(User user, String name);

    /**
     * Count categories for a user.
     */
    long countByUser(User user);
}
