package com.nikguscode.tbankapi.dto.request;

import java.util.UUID;

public record EmployeeDto(
    UUID standId,
    String login,
    String password,
    String firstName,
    String secondName,
    String lastName
) {}