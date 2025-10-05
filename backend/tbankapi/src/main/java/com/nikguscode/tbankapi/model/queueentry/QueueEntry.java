package com.nikguscode.tbankapi.model.queueentry;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder
public class QueueEntry {
  private final UUID id;
  private final UUID standId;
  private final UUID machineId;
  private final OffsetDateTime queuedAt;
  private final OffsetDateTime sessionStart;
  private final OffsetDateTime sessionEnd;
  private final QueueEntryStatus queueEntryStatus;
  private final int peopleAhead;
}