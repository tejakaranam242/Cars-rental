package com.rental.car.service;

import com.rental.car.dto.BookingRequest;
import com.rental.car.dto.BookingStatusUpdateRequest;
import com.rental.car.entity.Booking;
import com.rental.car.entity.BookingStatus;
import com.rental.car.entity.Car;
import com.rental.car.entity.User;
import com.rental.car.entity.UserRole;
import com.rental.car.repository.BookingRepository;
import com.rental.car.repository.CarRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private static final Set<BookingStatus> BLOCKING_STATUSES =
            EnumSet.of(BookingStatus.BOOKED);

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserService userService;

    public BookingService(
            BookingRepository bookingRepository,
            CarRepository carRepository,
            UserService userService
    ) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userService = userService;
    }

    public List<Booking> getBookingsByUser(Long userId) {
        userService.getUserOrThrow(userId);
        return bookingRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    public List<Booking> getAllBookings(Long adminUserId) {
        userService.ensureAdmin(adminUserId);
        return bookingRepository.findAll();
    }

    public Booking createBooking(BookingRequest req) {
        validateBookingRequest(req);

        userService.getUserOrThrow(req.getUserId());

        Car car = carRepository.findById(req.getCarId())
                .orElseThrow(() -> new IllegalArgumentException("Car not found"));

        boolean hasOverlappingBooking = bookingRepository
                .existsByCarIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        req.getCarId(),
                        BLOCKING_STATUSES,
                        req.getEndDate(),
                        req.getStartDate()
                );

        if (hasOverlappingBooking) {
            throw new IllegalStateException("Car already booked for selected dates");
        }

        long totalDays = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        double totalPrice = totalDays * car.getRentalPricePerDay();

        Booking booking = new Booking();
        booking.setUserId(req.getUserId());
        booking.setCarId(req.getCarId());
        booking.setStartDate(req.getStartDate());
        booking.setEndDate(req.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.BOOKED);

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(Long id, BookingStatusUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getActorUserId() == null) {
            throw new IllegalArgumentException("actorUserId is required");
        }

        BookingStatus nextStatus = parseStatus(request.getStatus());
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User actor = userService.getUserOrThrow(request.getActorUserId());

        if (actor.getRole() == UserRole.ADMIN) {
            booking.setStatus(nextStatus);
            return bookingRepository.save(booking);
        }

        if (!actor.getId().equals(booking.getUserId())) {
            throw new SecurityException("You can only update your own bookings");
        }
        if (nextStatus != BookingStatus.CANCELLED) {
            throw new SecurityException("Customers can only cancel bookings");
        }
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new IllegalStateException("Only BOOKED reservations can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    private void validateBookingRequest(BookingRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (req.getCarId() == null) {
            throw new IllegalArgumentException("carId is required");
        }
        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new IllegalArgumentException("startDate and endDate are required");
        }
        LocalDate today = LocalDate.now();
        if (req.getStartDate().isBefore(today)) {
            throw new IllegalArgumentException("startDate cannot be in the past");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new IllegalArgumentException("endDate must be on or after startDate");
        }
    }

    private BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        try {
            return BookingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status. Allowed: BOOKED, CANCELLED, COMPLETED");
        }
    }
}
