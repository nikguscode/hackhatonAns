package com.nikguscode.tbankapi.dto.request;

public record StandDto(
    String name,
    String volunteerFullName,
    String activityType,
    String startDateTime,
    String endDateTime
) {}
