package com.rental.car.repository;

import com.rental.car.entity.Booking;
import com.rental.car.entity.BookingStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByStartDateDesc(Long userId);

    @Query("""
        select distinct b.carId
        from Booking b
        where b.status in :statuses
          and b.startDate <= :endDate
          and b.endDate >= :startDate
        """)
    List<Long> findBlockedCarIds(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("statuses") Collection<BookingStatus> statuses
    );

    boolean existsByCarIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        Long carId,
        Collection<BookingStatus> statuses,
        LocalDate endDate,
        LocalDate startDate
    );
}
