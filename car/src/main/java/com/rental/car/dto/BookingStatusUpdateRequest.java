package com.rental.car.dto;

public class BookingStatusUpdateRequest {
    private String status;
    private Long actorUserId;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }
}
