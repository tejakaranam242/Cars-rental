package com.rental.car.service;

import com.rental.car.dto.AuthRequest;
import com.rental.car.dto.RegisterRequest;
import com.rental.car.entity.User;
import com.rental.car.entity.UserRole;
import com.rental.car.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        String normalizedEmail = normalizeEmail(request.getEmail());
        String name = normalizeName(request.getName());
        String password = request.getPassword();

        if (normalizedEmail.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        Optional<User> existing = userRepository.findByEmail(normalizedEmail);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.CUSTOMER);

        return userRepository.save(user);
    }

    public User login(AuthRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (email.isEmpty() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return user;
    }

    public User getUserOrThrow(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id is required");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void ensureAdmin(Long userId) {
        User user = getUserOrThrow(userId);
        if (user.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Admin access required");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase();
    }

    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }
        return name.trim();
    }
}
