package com.nikguscode.tbankapi.mapper;

import com.nikguscode.tbankapi.dto.request.EmployeeDto;
import com.nikguscode.tbankapi.model.employee.Employee;
import com.nikguscode.tbankapi.model.employee.Role;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeDtoMapper {
  @Mapping(target = "id", source = "id")
  @Mapping(target = "role", source = "role")
  Employee dtoToEmployee(UUID id, EmployeeDto dto, Role role);

  com.nikguscode.tbankapi.dto.response.EmployeeDto employeeToDto(Employee employee);
}