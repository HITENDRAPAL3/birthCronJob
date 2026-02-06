package com.birthday.reminder.service;

import com.birthday.reminder.dto.CategoryRequest;
import com.birthday.reminder.dto.CategoryResponse;
import com.birthday.reminder.entity.Category;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.exception.BadRequestException;
import com.birthday.reminder.exception.ResourceNotFoundException;
import com.birthday.reminder.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for category operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Get all categories for a user.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(User user) {
        return categoryRepository.findByUserOrderByNameAsc(user)
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a category by ID.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, User user) {
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return CategoryResponse.fromEntity(category);
    }

    /**
     * Create a new category.
     */
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User user) {
        if (categoryRepository.existsByUserAndNameIgnoreCase(user, request.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .icon(request.getIcon() != null ? request.getIcon() : "folder")
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: {} for user: {}", saved.getName(), user.getEmail());
        return CategoryResponse.fromEntity(saved);
    }

    /**
     * Update a category.
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, User user) {
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check for duplicate name (excluding current category)
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByUserAndNameIgnoreCase(user, request.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }

        category.setName(request.getName());
        if (request.getColor() != null) {
            category.setColor(request.getColor());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }

        Category updated = categoryRepository.save(category);
        log.info("Category updated: {}", updated.getName());
        return CategoryResponse.fromEntity(updated);
    }

    /**
     * Delete a category.
     */
    @Transactional
    public void deleteCategory(Long id, User user) {
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Birthdays with this category will have their category set to null
        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }

    /**
     * Create default categories for a new user.
     */
    @Transactional
    public void createDefaultCategories(User user) {
        if (categoryRepository.countByUser(user) == 0) {
            List<Category> defaults = Category.createDefaults(user);
            categoryRepository.saveAll(defaults);
            log.info("Created default categories for user: {}", user.getEmail());
        }
    }
}
