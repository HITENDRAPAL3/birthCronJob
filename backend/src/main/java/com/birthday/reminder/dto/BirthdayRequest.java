package com.birthday.reminder.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating/updating a birthday.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BirthdayRequest {

    @NotBlank(message = "Friend's name is required")
    @Size(min = 1, max = 100, message = "Friend's name must be between 1 and 100 characters")
    private String friendName;

    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @Email(message = "Please provide a valid email address")
    private String friendEmail;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    private Long categoryId;

    private Boolean isActive = true;
}
