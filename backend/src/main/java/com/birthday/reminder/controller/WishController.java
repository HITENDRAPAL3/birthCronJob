package com.birthday.reminder.controller;

import com.birthday.reminder.dto.ApiResponse;
import com.birthday.reminder.entity.Birthday;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.exception.ResourceNotFoundException;
import com.birthday.reminder.repository.BirthdayRepository;
import com.birthday.reminder.service.WishService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for birthday wish generation.
 */
@RestController
@RequestMapping("/api/wishes")
@RequiredArgsConstructor
@Slf4j
public class WishController {

    private final WishService wishService;
    private final BirthdayRepository birthdayRepository;

    /**
     * Generate birthday wish suggestions for a specific birthday.
     * GET /api/wishes/{birthdayId}?count=5&tone=funny
     * 
     * @param birthdayId The birthday to generate wishes for
     * @param count Number of wishes to generate (default: 5, max: 10)
     * @param tone Optional tone filter: heartfelt, funny, inspirational, formal
     * @return List of personalized birthday wishes
     */
    @GetMapping("/{birthdayId}")
    public ResponseEntity<ApiResponse<List<String>>> generateWishes(
            @PathVariable Long birthdayId,
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(required = false) String tone,
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/wishes/{} with count={}, tone={}", birthdayId, count, tone);

        // Validate count
        if (count < 1) count = 1;
        if (count > 10) count = 10;

        // Get the birthday
        Birthday birthday = birthdayRepository.findByIdAndUser(birthdayId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Birthday", "id", birthdayId));

        // Generate wishes
        List<String> wishes = wishService.generateWishes(birthday, count, tone);
        
        return ResponseEntity.ok(ApiResponse.success(wishes));
    }

    /**
     * Get available tone options.
     * GET /api/wishes/tones
     */
    @GetMapping("/tones")
    public ResponseEntity<ApiResponse<List<ToneOption>>> getToneOptions() {
        List<ToneOption> tones = List.of(
            new ToneOption("heartfelt", "Heartfelt", "Warm and emotional messages"),
            new ToneOption("funny", "Funny", "Light-hearted and humorous"),
            new ToneOption("inspirational", "Inspirational", "Motivating and uplifting"),
            new ToneOption("formal", "Formal", "Professional and respectful")
        );
        return ResponseEntity.ok(ApiResponse.success(tones));
    }

    /**
     * DTO for tone options.
     */
    record ToneOption(String value, String label, String description) {}
}
