package com.birthday.reminder.service;

import com.birthday.reminder.dto.BirthdayRequest;
import com.birthday.reminder.dto.BirthdayResponse;
import com.birthday.reminder.entity.Birthday;
import com.birthday.reminder.entity.Category;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.exception.BadRequestException;
import com.birthday.reminder.exception.ResourceNotFoundException;
import com.birthday.reminder.repository.BirthdayRepository;
import com.birthday.reminder.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for birthday CRUD operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BirthdayService {

    private final BirthdayRepository birthdayRepository;
    private final CategoryRepository categoryRepository;

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy")
    );

    /**
     * Get all birthdays for a user.
     */
    @Transactional(readOnly = true)
    public List<BirthdayResponse> getAllBirthdays(User user) {
        log.debug("Fetching all birthdays for user: {}", user.getEmail());
        return birthdayRepository.findByUserOrderByBirthDateAsc(user)
                .stream()
                .map(BirthdayResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get birthdays by category.
     */
    @Transactional(readOnly = true)
    public List<BirthdayResponse> getBirthdaysByCategory(User user, Long categoryId) {
        log.debug("Fetching birthdays for user: {} in category: {}", user.getEmail(), categoryId);
        Category category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        return birthdayRepository.findByUserAndCategoryOrderByBirthDateAsc(user, category)
                .stream()
                .map(BirthdayResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific birthday by ID.
     */
    @Transactional(readOnly = true)
    public BirthdayResponse getBirthdayById(Long id, User user) {
        log.debug("Fetching birthday {} for user: {}", id, user.getEmail());
        Birthday birthday = birthdayRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Birthday", "id", id));
        return BirthdayResponse.fromEntity(birthday);
    }

    /**
     * Create a new birthday.
     */
    @Transactional
    public BirthdayResponse createBirthday(BirthdayRequest request, User user) {
        log.debug("Creating birthday for friend: {} by user: {}", request.getFriendName(), user.getEmail());

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUser(request.getCategoryId(), user)
                    .orElse(null);
        }

        Birthday birthday = Birthday.builder()
                .user(user)
                .friendName(request.getFriendName())
                .birthDate(request.getBirthDate())
                .friendEmail(request.getFriendEmail())
                .notes(request.getNotes())
                .category(category)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Birthday savedBirthday = birthdayRepository.save(birthday);
        log.info("Birthday created successfully with id: {}", savedBirthday.getId());
        
        return BirthdayResponse.fromEntity(savedBirthday);
    }

    /**
     * Update an existing birthday.
     */
    @Transactional
    public BirthdayResponse updateBirthday(Long id, BirthdayRequest request, User user) {
        log.debug("Updating birthday {} for user: {}", id, user.getEmail());

        Birthday birthday = birthdayRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Birthday", "id", id));

        birthday.setFriendName(request.getFriendName());
        birthday.setBirthDate(request.getBirthDate());
        birthday.setFriendEmail(request.getFriendEmail());
        birthday.setNotes(request.getNotes());
        
        // Update category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUser(request.getCategoryId(), user)
                    .orElse(null);
            birthday.setCategory(category);
        } else {
            birthday.setCategory(null);
        }
        
        if (request.getIsActive() != null) {
            birthday.setIsActive(request.getIsActive());
        }

        Birthday updatedBirthday = birthdayRepository.save(birthday);
        log.info("Birthday updated successfully: {}", updatedBirthday.getId());
        
        return BirthdayResponse.fromEntity(updatedBirthday);
    }

    /**
     * Delete a birthday.
     */
    @Transactional
    public void deleteBirthday(Long id, User user) {
        log.debug("Deleting birthday {} for user: {}", id, user.getEmail());

        Birthday birthday = birthdayRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Birthday", "id", id));

        birthdayRepository.delete(birthday);
        log.info("Birthday deleted successfully: {}", id);
    }

    /**
     * Get upcoming birthdays within a specified number of days.
     */
    @Transactional(readOnly = true)
    public List<BirthdayResponse> getUpcomingBirthdays(User user, int days) {
        log.debug("Fetching upcoming birthdays for user: {} within {} days", user.getEmail(), days);
        
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);

        return birthdayRepository.findByUserAndIsActiveTrueOrderByBirthDateAsc(user)
                .stream()
                .filter(birthday -> {
                    LocalDate upcomingBirthday = birthday.getUpcomingBirthday();
                    return !upcomingBirthday.isBefore(today) && !upcomingBirthday.isAfter(endDate);
                })
                .sorted((b1, b2) -> Long.compare(b1.getDaysUntilBirthday(), b2.getDaysUntilBirthday()))
                .map(BirthdayResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Search birthdays by friend name.
     */
    @Transactional(readOnly = true)
    public List<BirthdayResponse> searchBirthdays(User user, String name) {
        log.debug("Searching birthdays for user: {} with name: {}", user.getEmail(), name);
        return birthdayRepository.searchByFriendName(user, name)
                .stream()
                .map(BirthdayResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get birthday count for a user.
     */
    @Transactional(readOnly = true)
    public long getBirthdayCount(User user) {
        return birthdayRepository.countByUser(user);
    }

    /**
     * Find birthdays that match a specific date for notification.
     */
    @Transactional(readOnly = true)
    public List<Birthday> findBirthdaysForDate(LocalDate date) {
        return birthdayRepository.findByMonthAndDay(date.getMonthValue(), date.getDayOfMonth());
    }

    /**
     * Import birthdays from CSV file.
     * Expected format: friendName,birthDate,email(optional),notes(optional),category(optional)
     */
    @Transactional
    public Map<String, Object> importFromCsv(MultipartFile file, User user) {
        log.info("Importing birthdays from CSV for user: {}", user.getEmail());
        
        List<BirthdayResponse> imported = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int lineNumber = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;
            
            // Get user's categories for mapping
            Map<String, Category> categoryMap = categoryRepository.findByUserOrderByNameAsc(user)
                    .stream()
                    .collect(Collectors.toMap(
                            c -> c.getName().toLowerCase(),
                            c -> c,
                            (existing, replacement) -> existing
                    ));

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                
                // Skip empty lines
                if (line.trim().isEmpty()) continue;
                
                // Skip header row
                if (isHeader) {
                    isHeader = false;
                    if (line.toLowerCase().contains("name") || line.toLowerCase().contains("date")) {
                        continue;
                    }
                }

                try {
                    String[] parts = parseCsvLine(line);
                    if (parts.length < 2) {
                        errors.add("Line " + lineNumber + ": Invalid format (need at least name and date)");
                        continue;
                    }

                    String friendName = parts[0].trim();
                    if (friendName.isEmpty()) {
                        errors.add("Line " + lineNumber + ": Name is required");
                        continue;
                    }

                    LocalDate birthDate = parseDate(parts[1].trim());
                    if (birthDate == null) {
                        errors.add("Line " + lineNumber + ": Invalid date format");
                        continue;
                    }

                    String email = parts.length > 2 ? parts[2].trim() : null;
                    String notes = parts.length > 3 ? parts[3].trim() : null;
                    String categoryName = parts.length > 4 ? parts[4].trim().toLowerCase() : null;
                    
                    Category category = categoryName != null ? categoryMap.get(categoryName) : null;

                    Birthday birthday = Birthday.builder()
                            .user(user)
                            .friendName(friendName)
                            .birthDate(birthDate)
                            .friendEmail(email != null && !email.isEmpty() ? email : null)
                            .notes(notes != null && !notes.isEmpty() ? notes : null)
                            .category(category)
                            .isActive(true)
                            .build();

                    Birthday saved = birthdayRepository.save(birthday);
                    imported.add(BirthdayResponse.fromEntity(saved));
                    
                } catch (Exception e) {
                    errors.add("Line " + lineNumber + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error reading CSV file: {}", e.getMessage());
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        log.info("CSV import completed. Imported: {}, Errors: {}", imported.size(), errors.size());
        
        Map<String, Object> result = new HashMap<>();
        result.put("imported", imported);
        result.put("importedCount", imported.size());
        result.put("errors", errors);
        result.put("errorCount", errors.size());
        return result;
    }

    /**
     * Export birthdays to iCal format.
     */
    @Transactional(readOnly = true)
    public String exportToICal(User user) {
        log.info("Exporting birthdays to iCal for user: {}", user.getEmail());
        
        List<Birthday> birthdays = birthdayRepository.findByUserAndIsActiveTrueOrderByBirthDateAsc(user);
        
        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:2.0\r\n");
        ical.append("PRODID:-//Birthday Reminder//EN\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        ical.append("X-WR-CALNAME:Birthdays\r\n");

        int currentYear = LocalDate.now().getYear();
        
        for (Birthday birthday : birthdays) {
            LocalDate upcomingBirthday = birthday.getUpcomingBirthday();
            int age = birthday.calculateAge() + 1;
            
            String uid = "birthday-" + birthday.getId() + "-" + upcomingBirthday.getYear() + "@birthdayreminder";
            String summary = birthday.getFriendName() + "'s Birthday";
            String description = birthday.getFriendName() + " is turning " + age;
            if (birthday.getNotes() != null && !birthday.getNotes().isEmpty()) {
                description += "\\n\\nNotes: " + birthday.getNotes().replace("\n", "\\n");
            }

            ical.append("BEGIN:VEVENT\r\n");
            ical.append("UID:").append(uid).append("\r\n");
            ical.append("DTSTART;VALUE=DATE:").append(formatICalDate(upcomingBirthday)).append("\r\n");
            ical.append("DTEND;VALUE=DATE:").append(formatICalDate(upcomingBirthday.plusDays(1))).append("\r\n");
            ical.append("SUMMARY:").append(escapeICalText(summary)).append("\r\n");
            ical.append("DESCRIPTION:").append(escapeICalText(description)).append("\r\n");
            ical.append("RRULE:FREQ=YEARLY\r\n");
            ical.append("TRANSP:TRANSPARENT\r\n");
            
            if (birthday.getCategory() != null) {
                ical.append("CATEGORIES:").append(birthday.getCategory().getName()).append("\r\n");
            }
            
            ical.append("END:VEVENT\r\n");
        }

        ical.append("END:VCALENDAR\r\n");
        return ical.toString();
    }

    /**
     * Get analytics data for dashboard.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics(User user) {
        log.debug("Getting analytics for user: {}", user.getEmail());
        
        List<Birthday> birthdays = birthdayRepository.findByUserOrderByBirthDateAsc(user);
        Map<String, Object> analytics = new HashMap<>();

        // Monthly distribution
        Map<String, Long> monthlyDistribution = new LinkedHashMap<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (String month : months) {
            monthlyDistribution.put(month, 0L);
        }
        for (Birthday birthday : birthdays) {
            int monthIndex = birthday.getBirthDate().getMonthValue() - 1;
            String month = months[monthIndex];
            monthlyDistribution.put(month, monthlyDistribution.get(month) + 1);
        }
        analytics.put("monthlyDistribution", monthlyDistribution);

        // Category distribution
        Map<String, Long> categoryDistribution = new HashMap<>();
        categoryDistribution.put("Uncategorized", 0L);
        for (Birthday birthday : birthdays) {
            String categoryName = birthday.getCategory() != null ? birthday.getCategory().getName() : "Uncategorized";
            categoryDistribution.put(categoryName, categoryDistribution.getOrDefault(categoryName, 0L) + 1);
        }
        analytics.put("categoryDistribution", categoryDistribution);

        // Upcoming birthdays count by time periods
        LocalDate today = LocalDate.now();
        long next7Days = birthdays.stream()
                .filter(b -> b.getIsActive() && b.getDaysUntilBirthday() <= 7)
                .count();
        long next30Days = birthdays.stream()
                .filter(b -> b.getIsActive() && b.getDaysUntilBirthday() <= 30)
                .count();
        long next90Days = birthdays.stream()
                .filter(b -> b.getIsActive() && b.getDaysUntilBirthday() <= 90)
                .count();
        
        analytics.put("upcomingIn7Days", next7Days);
        analytics.put("upcomingIn30Days", next30Days);
        analytics.put("upcomingIn90Days", next90Days);

        // Total counts
        analytics.put("totalBirthdays", birthdays.size());
        analytics.put("activeBirthdays", birthdays.stream().filter(Birthday::getIsActive).count());

        // Age distribution
        Map<String, Long> ageDistribution = new LinkedHashMap<>();
        ageDistribution.put("0-18", 0L);
        ageDistribution.put("19-30", 0L);
        ageDistribution.put("31-50", 0L);
        ageDistribution.put("51-70", 0L);
        ageDistribution.put("71+", 0L);
        
        for (Birthday birthday : birthdays) {
            int age = birthday.calculateAge();
            if (age <= 18) ageDistribution.put("0-18", ageDistribution.get("0-18") + 1);
            else if (age <= 30) ageDistribution.put("19-30", ageDistribution.get("19-30") + 1);
            else if (age <= 50) ageDistribution.put("31-50", ageDistribution.get("31-50") + 1);
            else if (age <= 70) ageDistribution.put("51-70", ageDistribution.get("51-70") + 1);
            else ageDistribution.put("71+", ageDistribution.get("71+") + 1);
        }
        analytics.put("ageDistribution", ageDistribution);

        return analytics;
    }

    // Helper methods

    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }
        return null;
    }

    private String[] parseCsvLine(String line) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                parts.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        parts.add(current.toString());
        
        return parts.toArray(new String[0]);
    }

    private String formatICalDate(LocalDate date) {
        return String.format("%04d%02d%02d", date.getYear(), date.getMonthValue(), date.getDayOfMonth());
    }

    private String escapeICalText(String text) {
        return text.replace("\\", "\\\\")
                   .replace(",", "\\,")
                   .replace(";", "\\;")
                   .replace("\n", "\\n");
    }
}
