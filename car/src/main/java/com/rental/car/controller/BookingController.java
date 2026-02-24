package com.rental.car.controller;

import com.rental.car.dto.BookingRequest;
import com.rental.car.dto.BookingStatusUpdateRequest;
import com.rental.car.entity.Booking;
import com.rental.car.service.BookingService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(@RequestBody BookingRequest req) {
        return bookingService.createBooking(req);
    }

    @GetMapping
    public List<Booking> getAllBookings(@RequestHeader("X-USER-ID") Long adminUserId) {
        return bookingService.getAllBookings(adminUserId);
    }

    @GetMapping("/user/{id}")
    public List<Booking> getBookingsByUser(@PathVariable Long id) {
        return bookingService.getBookingsByUser(id);
    }

    @PutMapping("/{id}")
    public Booking updateBookingStatus(
            @PathVariable Long id,
            @RequestBody BookingStatusUpdateRequest request
    ) {
        return bookingService.updateBookingStatus(id, request);
    }
}
