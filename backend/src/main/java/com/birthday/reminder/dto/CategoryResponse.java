package com.birthday.reminder.dto;

import com.birthday.reminder.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for category response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String color;
    private String icon;
    private int birthdayCount;

    /**
     * Convert Category entity to response DTO.
     */
    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .icon(category.getIcon())
                .birthdayCount(category.getBirthdays() != null ? category.getBirthdays().size() : 0)
                .build();
    }
}
