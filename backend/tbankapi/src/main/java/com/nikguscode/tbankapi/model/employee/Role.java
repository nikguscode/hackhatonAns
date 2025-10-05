package com.nikguscode.tbankapi.model.employee;

import lombok.Getter;

@Getter
public enum Role {
  GUEST("GUEST"),
  VOLUNTEER("VOLUNTEER"),
  ADMIN("ADMIN");

  private final String dbValue;

  Role(String dbValue) {
    this.dbValue = dbValue;
  }
}