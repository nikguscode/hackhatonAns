package com.nikguscode.tbankapi.dto.response;

import java.util.UUID;

public record QueueEntryDto(
    UUID queueId,
    UUID standId,
    String standName,
    String standActivityType,
    String queuedAt
) {}