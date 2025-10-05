package com.nikguscode.tbankapi.model;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class Machine {
  private final UUID id;
  private final String sessionId;
  private final String uniqueId;
  private final String machineNumber;
  private final OffsetDateTime registrationDateTime;
  private final OffsetDateTime expirationDateTime;
}