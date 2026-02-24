package com.rental.car.config;

import com.rental.car.entity.User;
import com.rental.car.entity.UserRole;
import com.rental.car.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@demo.com").isEmpty()) {
                User admin = new User();
                admin.setName("HCL Admin");
                admin.setEmail("admin@demo.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}
