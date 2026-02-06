package com.birthday.reminder.service;

import com.birthday.reminder.dto.AuthRequest;
import com.birthday.reminder.dto.AuthResponse;
import com.birthday.reminder.dto.RegisterRequest;
import com.birthday.reminder.entity.NotificationSettings;
import com.birthday.reminder.entity.User;
import com.birthday.reminder.exception.BadRequestException;
import com.birthday.reminder.repository.NotificationSettingsRepository;
import com.birthday.reminder.repository.UserRepository;
import com.birthday.reminder.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final CategoryService categoryService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.debug("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Create default notification settings
        NotificationSettings settings = NotificationSettings.createDefault(savedUser);
        notificationSettingsRepository.save(settings);

        // Create default categories
        categoryService.createDefaultCategories(savedUser);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());

        return AuthResponse.of(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                jwtTokenProvider.getExpirationTime()
        );
    }

    /**
     * Authenticate user and generate JWT token.
     */
    public AuthResponse login(AuthRequest request) {
        log.debug("Authenticating user: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authentication);

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.of(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                jwtTokenProvider.getExpirationTime()
        );
    }
}
