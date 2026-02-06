package com.birthday.reminder.controller;

import com.birthday.reminder.dto.ApiResponse;
import com.birthday.reminder.dto.BirthdayRequest;
import com.birthday.reminder.dto.BirthdayResponse;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.service.BirthdayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for birthday CRUD operations.
 */
@RestController
@RequestMapping("/api/birthdays")
@RequiredArgsConstructor
@Slf4j
public class BirthdayController {

    private final BirthdayService birthdayService;

    /**
     * Get all birthdays for the authenticated user.
     * GET /api/birthdays
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BirthdayResponse>>> getAllBirthdays(
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays for user: {}", user.getEmail());
        List<BirthdayResponse> birthdays = birthdayService.getAllBirthdays(user);
        return ResponseEntity.ok(ApiResponse.success(birthdays));
    }

    /**
     * Get birthdays by category.
     * GET /api/birthdays/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<BirthdayResponse>>> getBirthdaysByCategory(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays/category/{} for user: {}", categoryId, user.getEmail());
        List<BirthdayResponse> birthdays = birthdayService.getBirthdaysByCategory(user, categoryId);
        return ResponseEntity.ok(ApiResponse.success(birthdays));
    }

    /**
     * Get a specific birthday by ID.
     * GET /api/birthdays/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BirthdayResponse>> getBirthdayById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays/{} for user: {}", id, user.getEmail());
        BirthdayResponse birthday = birthdayService.getBirthdayById(id, user);
        return ResponseEntity.ok(ApiResponse.success(birthday));
    }

    /**
     * Create a new birthday.
     * POST /api/birthdays
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BirthdayResponse>> createBirthday(
            @Valid @RequestBody BirthdayRequest request,
            @AuthenticationPrincipal User user
    ) {
        log.debug("POST /api/birthdays for user: {}", user.getEmail());
        BirthdayResponse birthday = birthdayService.createBirthday(request, user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Birthday created successfully", birthday));
    }

    /**
     * Update an existing birthday.
     * PUT /api/birthdays/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BirthdayResponse>> updateBirthday(
            @PathVariable Long id,
            @Valid @RequestBody BirthdayRequest request,
            @AuthenticationPrincipal User user
    ) {
        log.debug("PUT /api/birthdays/{} for user: {}", id, user.getEmail());
        BirthdayResponse birthday = birthdayService.updateBirthday(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Birthday updated successfully", birthday));
    }

    /**
     * Delete a birthday.
     * DELETE /api/birthdays/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBirthday(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        log.debug("DELETE /api/birthdays/{} for user: {}", id, user.getEmail());
        birthdayService.deleteBirthday(id, user);
        return ResponseEntity.ok(ApiResponse.success("Birthday deleted successfully", null));
    }

    /**
     * Get upcoming birthdays within a specified number of days.
     * GET /api/birthdays/upcoming?days=30
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<BirthdayResponse>>> getUpcomingBirthdays(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays/upcoming?days={} for user: {}", days, user.getEmail());
        List<BirthdayResponse> birthdays = birthdayService.getUpcomingBirthdays(user, days);
        return ResponseEntity.ok(ApiResponse.success(birthdays));
    }

    /**
     * Search birthdays by friend name.
     * GET /api/birthdays/search?name=John
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BirthdayResponse>>> searchBirthdays(
            @RequestParam String name,
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays/search?name={} for user: {}", name, user.getEmail());
        List<BirthdayResponse> birthdays = birthdayService.searchBirthdays(user, name);
        return ResponseEntity.ok(ApiResponse.success(birthdays));
    }

    /**
     * Import birthdays from CSV file.
     * POST /api/birthdays/import
     */
    @PostMapping("/import")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importFromCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        log.debug("POST /api/birthdays/import for user: {}", user.getEmail());
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a CSV file to upload"));
        }
        
        Map<String, Object> result = birthdayService.importFromCsv(file, user);
        return ResponseEntity.ok(ApiResponse.success("Import completed", result));
    }

    /**
     * Export birthdays to iCal format.
     * GET /api/birthdays/export/ical
     */
    @GetMapping("/export/ical")
    public ResponseEntity<String> exportToICal(@AuthenticationPrincipal User user) {
        log.debug("GET /api/birthdays/export/ical for user: {}", user.getEmail());
        
        String icalContent = birthdayService.exportToICal(user);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar"));
        headers.setContentDispositionFormData("attachment", "birthdays.ics");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(icalContent);
    }

    /**
     * Get analytics data for dashboard.
     * GET /api/birthdays/analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @AuthenticationPrincipal User user
    ) {
        log.debug("GET /api/birthdays/analytics for user: {}", user.getEmail());
        Map<String, Object> analytics = birthdayService.getAnalytics(user);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
