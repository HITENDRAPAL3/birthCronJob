package com.birthday.reminder.controller;

import com.birthday.reminder.dto.ApiResponse;
import com.birthday.reminder.dto.CategoryRequest;
import com.birthday.reminder.dto.CategoryResponse;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for category operations.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Get all categories for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @AuthenticationPrincipal User user
    ) {
        List<CategoryResponse> categories = categoryService.getAllCategories(user);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Get a category by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse category = categoryService.getCategoryById(id, user);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Create a new category.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse category = categoryService.createCategory(request, user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    /**
     * Update a category.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        CategoryResponse category = categoryService.updateCategory(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    /**
     * Delete a category.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        categoryService.deleteCategory(id, user);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
