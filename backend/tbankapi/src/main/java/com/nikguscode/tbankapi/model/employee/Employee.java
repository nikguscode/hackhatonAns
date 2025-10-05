package com.nikguscode.tbankapi.model.employee;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import lombok.With;

@AllArgsConstructor
@Getter
@ToString
public class Employee {
  private final UUID id;
  private final UUID standId;

  @With
  private final UUID machineId;

  private final String login;
  private final String password;
  private final String firstName;
  private final String secondName;
  private final String lastName;
  private final Role role;
}