package com.nikguscode.tbankapi.dao.employee;

import com.nikguscode.tbankapi.model.employee.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeDao {
  void add(Employee employee);

  Optional<Employee> get(String login);

  void deleteByStandId(UUID standId);

  void updateEmployee(Employee employee);

  Optional<Employee> getByMachineId(UUID machineId);

  List<Employee> getAll();
}