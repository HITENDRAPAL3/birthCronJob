package com.birthday.reminder.service;

import com.birthday.reminder.entity.Birthday;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for generating birthday wish suggestions using templates.
 * No external AI dependencies - uses smart template selection and personalization.
 */
@Service
@Slf4j
public class WishService {

    private static final Random random = new Random();

    /**
     * Generate birthday wish suggestions for a friend.
     * 
     * @param birthday The birthday entity with friend info
     * @param count Number of wishes to generate
     * @param tone Optional tone filter: "heartfelt", "funny", "inspirational", "formal", or null for mixed
     * @return List of personalized birthday wishes
     */
    public List<String> generateWishes(Birthday birthday, int count, String tone) {
        String friendName = birthday.getFriendName();
        String firstName = friendName.split(" ")[0]; // Use first name for more personal feel
        int age = birthday.calculateAge() + 1;
        String category = birthday.getCategory() != null ? birthday.getCategory().getName() : "friend";
        String notes = birthday.getNotes();

        log.debug("Generating {} wishes for {} (age {}, category: {})", count, friendName, age, category);

        // Get templates based on category and tone
        List<WishTemplate> templates = getTemplates(category, tone);
        Collections.shuffle(templates);

        // Generate personalized wishes
        List<String> wishes = new ArrayList<>();
        Set<String> usedTemplates = new HashSet<>();

        for (WishTemplate template : templates) {
            if (wishes.size() >= count) break;
            
            String wish = personalizeWish(template, firstName, friendName, age, category, notes);
            
            // Avoid duplicates
            if (!usedTemplates.contains(template.template)) {
                wishes.add(wish);
                usedTemplates.add(template.template);
            }
        }

        log.info("Generated {} wishes for {}", wishes.size(), friendName);
        return wishes;
    }

    /**
     * Personalize a wish template with the friend's details.
     */
    private String personalizeWish(WishTemplate template, String firstName, String fullName, 
                                   int age, String category, String notes) {
        String wish = template.template
                .replace("{name}", firstName)
                .replace("{fullName}", fullName)
                .replace("{age}", String.valueOf(age))
                .replace("{ordinal}", getOrdinal(age));

        // Add category-specific touches if applicable
        if (wish.contains("{relation}")) {
            wish = wish.replace("{relation}", getRelationWord(category));
        }

        return wish;
    }

    /**
     * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
     */
    private String getOrdinal(int n) {
        if (n >= 11 && n <= 13) {
            return n + "th";
        }
        switch (n % 10) {
            case 1: return n + "st";
            case 2: return n + "nd";
            case 3: return n + "rd";
            default: return n + "th";
        }
    }

    /**
     * Get a relation word based on category.
     */
    private String getRelationWord(String category) {
        switch (category.toLowerCase()) {
            case "family": return "family member";
            case "friends": return "friend";
            case "work": return "colleague";
            case "college": return "friend";
            default: return "friend";
        }
    }

    /**
     * Get templates filtered by category and tone.
     */
    private List<WishTemplate> getTemplates(String category, String tone) {
        List<WishTemplate> all = new ArrayList<>();
        
        // Add universal templates
        all.addAll(getUniversalTemplates());
        
        // Add category-specific templates
        all.addAll(getCategoryTemplates(category));
        
        // Filter by tone if specified
        if (tone != null && !tone.isEmpty()) {
            String toneLower = tone.toLowerCase();
            all.removeIf(t -> !t.tone.equals(toneLower) && !t.tone.equals("neutral"));
        }
        
        return all;
    }

    /**
     * Universal birthday wish templates.
     */
    private List<WishTemplate> getUniversalTemplates() {
        return new ArrayList<>(List.of(
            // Heartfelt
            new WishTemplate("Happy {ordinal} birthday, {name}! May this year bring you endless joy, beautiful moments, and all the happiness you deserve. 🎂✨", "heartfelt"),
            new WishTemplate("Wishing you the happiest of birthdays, {name}! You're such an amazing person, and I hope your {ordinal} year is filled with love and laughter. 💕", "heartfelt"),
            new WishTemplate("{name}, happy birthday! Another year of you being awesome! May all your dreams come true this year. 🌟", "heartfelt"),
            new WishTemplate("Happy birthday to someone who makes the world a brighter place just by being in it! Have an amazing {ordinal} birthday, {name}! 🎈", "heartfelt"),
            new WishTemplate("To a truly wonderful person - happy {ordinal} birthday, {name}! Wishing you a day filled with love, laughter, and cake! 🎂", "heartfelt"),
            
            // Funny
            new WishTemplate("Happy {ordinal} birthday, {name}! Don't worry about getting older - you're like a fine wine, getting better with age! 🍷😄", "funny"),
            new WishTemplate("{name}, you're not {age}, you're just {age} years young with a lot of experience! Happy birthday! 🎉😂", "funny"),
            new WishTemplate("Happy birthday, {name}! At {age}, you've officially unlocked the 'distinguished' achievement! Level up! 🎮🎂", "funny"),
            new WishTemplate("Congrats on surviving another trip around the sun, {name}! {age} looks great on you! 🌞🎈", "funny"),
            new WishTemplate("Happy {ordinal} birthday! Remember, age is just a number... a really big, scary number! Just kidding, {name}! 😜🎂", "funny"),
            new WishTemplate("{name}, they say with age comes wisdom. So you must be REALLY wise by now! Happy {ordinal}! 🦉😄", "funny"),
            
            // Inspirational
            new WishTemplate("Happy {ordinal} birthday, {name}! May this new chapter bring you courage to chase your dreams and strength to achieve them all! 💪✨", "inspirational"),
            new WishTemplate("{name}, happy birthday! Your {ordinal} year is a blank canvas - paint it with bold colors and beautiful adventures! 🎨🌈", "inspirational"),
            new WishTemplate("Happy birthday, {name}! At {age}, you're just getting started. The best is yet to come! 🚀⭐", "inspirational"),
            new WishTemplate("Wishing you a birthday filled with new opportunities and exciting possibilities, {name}! Make your {ordinal} year legendary! 🌟", "inspirational"),
            new WishTemplate("{name}, happy {ordinal} birthday! Remember: every day is a chance to write a new story. Make yours epic! 📖✨", "inspirational"),
            
            // Formal/Professional
            new WishTemplate("Wishing you a very happy {ordinal} birthday, {name}. May this year bring you success and fulfillment in all your endeavors. 🎂", "formal"),
            new WishTemplate("Happy birthday, {name}! Wishing you a wonderful {ordinal} year filled with achievements and happiness. 🎈", "formal"),
            new WishTemplate("On your special day, {name}, I wish you a happy {ordinal} birthday and a year of continued success. Best wishes! 🌟", "formal"),
            
            // Neutral (works for any tone)
            new WishTemplate("Happy {ordinal} birthday, {name}! 🎂🎉", "neutral"),
            new WishTemplate("Wishing you an amazing birthday, {name}! Enjoy your special day! 🎈✨", "neutral"),
            new WishTemplate("Happy birthday, {name}! Hope your {ordinal} is absolutely wonderful! 🎂💫", "neutral")
        ));
    }

    /**
     * Category-specific birthday wish templates.
     */
    private List<WishTemplate> getCategoryTemplates(String category) {
        List<WishTemplate> templates = new ArrayList<>();
        
        switch (category.toLowerCase()) {
            case "family":
                templates.addAll(List.of(
                    new WishTemplate("Happy {ordinal} birthday to the most amazing {name}! Our family is blessed to have you. Love you always! 💕👨‍👩‍👧‍👦", "heartfelt"),
                    new WishTemplate("{name}, watching you turn {age} fills my heart with so much pride and love. Happy birthday to my favorite person! 🥰", "heartfelt"),
                    new WishTemplate("To my dear {name} on your {ordinal} birthday - you mean the world to our family! Here's to many more years of memories together! 💝", "heartfelt"),
                    new WishTemplate("Happy birthday, {name}! {age} years of being the best! Family gatherings wouldn't be the same without you! 🏠❤️", "heartfelt"),
                    new WishTemplate("{name}, happy {ordinal} birthday! Thank you for all the love and support you give our family. You're truly one of a kind! 🌟", "heartfelt"),
                    new WishTemplate("Happy birthday! At {age}, {name}, you're still the person I look up to most. Thanks for being such an amazing family member! 💪❤️", "inspirational")
                ));
                break;
                
            case "friends":
                templates.addAll(List.of(
                    new WishTemplate("Happy {ordinal} birthday to my partner in crime, {name}! Here's to many more adventures, late-night talks, and unforgettable memories! 🎊🤝", "heartfelt"),
                    new WishTemplate("{name}! Can you believe you're {age}?! You still act like you're 21 and I love that about you! Happy birthday, bestie! 😄🎉", "funny"),
                    new WishTemplate("To {name}, the friend who's been there through thick and thin - happy {ordinal} birthday! You're irreplaceable and I'm lucky to have you! 🤗💕", "heartfelt"),
                    new WishTemplate("Happy birthday, {name}! After all these years, you're still the friend who makes me laugh the hardest. Here's to {age} and beyond! 😂🎂", "funny"),
                    new WishTemplate("{name}, happy {ordinal}! Friends like you are rare gems. Thanks for being amazing! Now let's celebrate! 🎈💎", "heartfelt"),
                    new WishTemplate("Happy birthday to my favorite human! {name}, you're officially {age} years of pure awesomeness! 🌟🎉", "funny"),
                    new WishTemplate("To my ride-or-die {name} - happy {ordinal} birthday! Life is better with you in it! Let's make this year unforgettable! 🚀💫", "inspirational")
                ));
                break;
                
            case "work":
                templates.addAll(List.of(
                    new WishTemplate("Happy {ordinal} birthday, {name}! Working with you is always a pleasure. Wishing you success and happiness in the year ahead! 💼🎂", "formal"),
                    new WishTemplate("{name}, happy birthday! You bring so much positive energy to the team. May your {ordinal} year be as brilliant as you are! 🌟", "heartfelt"),
                    new WishTemplate("Happy birthday to a fantastic colleague! {name}, hope your {ordinal} is amazing. The office is lucky to have you! 🎈", "formal"),
                    new WishTemplate("Wishing you a wonderful {ordinal} birthday, {name}! Here's to another year of achievements and growth. You're a rockstar! 🚀", "inspirational"),
                    new WishTemplate("Happy birthday, {name}! At {age}, you've got the experience AND the energy. A winning combo! Have a great day! 💪🎉", "funny"),
                    new WishTemplate("{name}, happy {ordinal}! Thanks for being such a great colleague. Enjoy your special day - you've earned it! 🏆", "formal")
                ));
                break;
                
            case "college":
                templates.addAll(List.of(
                    new WishTemplate("Happy {ordinal} birthday, {name}! From late-night study sessions to graduation day - so glad we're still friends! 📚🎉", "heartfelt"),
                    new WishTemplate("{name}, turning {age} looks amazing on you! Remember when we thought finals were the hardest thing ever? Happy birthday! 🎓😄", "funny"),
                    new WishTemplate("To my college buddy {name} - happy {ordinal}! Those were the days, and you're still one of my favorite people! Cheers! 🍻", "heartfelt"),
                    new WishTemplate("Happy birthday, {name}! From dorm life to real life, you've always been awesome. Here's to {age}! 🏠🎂", "heartfelt"),
                    new WishTemplate("{name}! {age} years old and still cooler than our professors! Happy birthday to my favorite college memory! 😎🎈", "funny"),
                    new WishTemplate("Happy {ordinal} birthday! {name}, our college adventures were legendary, and so are you! Here's to many more! 🌟", "inspirational")
                ));
                break;
                
            default:
                // No additional category-specific templates for unknown categories
                break;
        }
        
        return templates;
    }

    /**
     * Inner class to hold template and its tone.
     */
    private static class WishTemplate {
        String template;
        String tone;

        WishTemplate(String template, String tone) {
            this.template = template;
            this.tone = tone;
        }
    }
}
