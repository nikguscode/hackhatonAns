package com.nikguscode.tbankapi.dto.request;

import com.nikguscode.tbankapi.model.queueentry.QueueEntryStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record QueueEntryDto(
    UUID standId,
    UUID machineId,
    OffsetDateTime queuedAt,
    QueueEntryStatus queueEntryStatus,
    int peopleAhead
) {}