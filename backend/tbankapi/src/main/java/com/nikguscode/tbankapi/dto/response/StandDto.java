package com.nikguscode.tbankapi.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StandDto(
    UUID id,
    String name,
    String activityType,
    OffsetDateTime startDateTime,
    OffsetDateTime endDateTime,
    String employeeFullName
) {}