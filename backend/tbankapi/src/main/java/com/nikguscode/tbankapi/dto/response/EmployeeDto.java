package com.nikguscode.tbankapi.dto.response;

import com.nikguscode.tbankapi.model.employee.Role;
import java.util.UUID;

public record EmployeeDto(
    UUID id,
    UUID standId,
    UUID machineId,
    String login,
    String firstName,
    String secondName,
    String lastName,
    Role role
) {}