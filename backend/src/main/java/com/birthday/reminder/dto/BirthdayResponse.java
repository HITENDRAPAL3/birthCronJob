package com.birthday.reminder.dto;

import com.birthday.reminder.entity.Birthday;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for birthday response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BirthdayResponse {

    private Long id;
    private String friendName;
    private LocalDate birthDate;
    private String friendEmail;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Category info
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    
    // Computed fields
    private Integer age;
    private Long daysUntilBirthday;
    private LocalDate upcomingBirthday;

    /**
     * Convert Birthday entity to BirthdayResponse DTO.
     */
    public static BirthdayResponse fromEntity(Birthday birthday) {
        BirthdayResponseBuilder builder = BirthdayResponse.builder()
                .id(birthday.getId())
                .friendName(birthday.getFriendName())
                .birthDate(birthday.getBirthDate())
                .friendEmail(birthday.getFriendEmail())
                .notes(birthday.getNotes())
                .isActive(birthday.getIsActive())
                .createdAt(birthday.getCreatedAt())
                .updatedAt(birthday.getUpdatedAt())
                .age(birthday.calculateAge())
                .daysUntilBirthday(birthday.getDaysUntilBirthday())
                .upcomingBirthday(birthday.getUpcomingBirthday());
        
        // Add category info if present
        if (birthday.getCategory() != null) {
            builder.categoryId(birthday.getCategory().getId())
                   .categoryName(birthday.getCategory().getName())
                   .categoryColor(birthday.getCategory().getColor());
        }
        
        return builder.build();
    }
}
