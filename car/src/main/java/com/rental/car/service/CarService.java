package com.rental.car.service;

import com.rental.car.entity.BookingStatus;
import com.rental.car.entity.Car;
import com.rental.car.repository.BookingRepository;
import com.rental.car.repository.CarRepository;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CarService {

    private static final Set<BookingStatus> BLOCKING_STATUSES =
            EnumSet.of(BookingStatus.BOOKED);

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserService userService;

    public CarService(
            CarRepository carRepository,
            BookingRepository bookingRepository,
            UserService userService
    ) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.userService = userService;
    }

    public List<Car> getCars(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return carRepository.findAll();
        }
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Both startDate and endDate are required to filter availability");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must be on or after startDate");
        }

        Set<Long> blockedCarIds = new HashSet<>(
                bookingRepository.findBlockedCarIds(startDate, endDate, BLOCKING_STATUSES)
        );

        if (blockedCarIds.isEmpty()) {
            return carRepository.findAll();
        }

        return carRepository.findAll().stream()
                .filter(car -> !blockedCarIds.contains(car.getId()))
                .toList();
    }

    public Car addCar(Car car, Long adminUserId) {
        userService.ensureAdmin(adminUserId);
        validateCar(car);
        return carRepository.save(car);
    }

    public Car updateCar(Long id, Car payload, Long adminUserId) {
        userService.ensureAdmin(adminUserId);
        validateCar(payload);

        Car existing = carRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car not found"));

        existing.setMake(payload.getMake().trim());
        existing.setModel(payload.getModel().trim());
        existing.setYear(payload.getYear());
        existing.setColor(payload.getColor() == null ? null : payload.getColor().trim());
        existing.setRentalPricePerDay(payload.getRentalPricePerDay());

        return carRepository.save(existing);
    }

    public void deleteCar(Long id, Long adminUserId) {
        userService.ensureAdmin(adminUserId);
        if (!carRepository.existsById(id)) {
            throw new IllegalArgumentException("Car not found");
        }
        carRepository.deleteById(id);
    }

    private void validateCar(Car car) {
        if (car == null) {
            throw new IllegalArgumentException("Car payload is required");
        }
        if (car.getMake() == null || car.getMake().trim().isEmpty()) {
            throw new IllegalArgumentException("Car make is required");
        }
        if (car.getModel() == null || car.getModel().trim().isEmpty()) {
            throw new IllegalArgumentException("Car model is required");
        }
        if (car.getYear() < 1990 || car.getYear() > LocalDate.now().getYear() + 1) {
            throw new IllegalArgumentException("Car year is invalid");
        }
        if (car.getRentalPricePerDay() <= 0) {
            throw new IllegalArgumentException("rentalPricePerDay must be greater than 0");
        }

        car.setMake(car.getMake().trim());
        car.setModel(car.getModel().trim());
        car.setColor(car.getColor() == null ? null : car.getColor().trim());
    }
}
