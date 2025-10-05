package com.nikguscode.tbankapi.model.stand;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

@AllArgsConstructor
@ToString
@Getter
public class Stand {
  private final UUID id;
  private final String name;
  private final StandActivityType activityType;
  private final OffsetDateTime startDateTime;
  private final OffsetDateTime endDateTime;
}