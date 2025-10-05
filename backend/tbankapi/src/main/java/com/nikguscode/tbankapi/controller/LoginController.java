package com.nikguscode.tbankapi.controller;

import com.nikguscode.tbankapi.dao.employee.EmployeeDao;
import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.dto.request.LoginDto;
import com.nikguscode.tbankapi.dto.response.EmployeeDto;
import com.nikguscode.tbankapi.mapper.EmployeeDtoMapper;
import com.nikguscode.tbankapi.model.Machine;
import com.nikguscode.tbankapi.model.employee.Employee;
import com.nikguscode.tbankapi.service.MachineService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/login", consumes = "application/json")
public class LoginController {
  private final EmployeeDao employeeDao;
  private final EmployeeDtoMapper employeeDtoMapper;
  private final MachineDao machineDao;

  public LoginController(
      @Qualifier("jooqMachineDao") MachineDao machineDao,
      @Qualifier("jooqEmployeeDao") EmployeeDao employeeDao,
      EmployeeDtoMapper employeeDtoMapper) {
    this.machineDao = machineDao;
    this.employeeDao = employeeDao;
    this.employeeDtoMapper = employeeDtoMapper;
  }

  @PostMapping
  public EmployeeDto login(
      @RequestBody LoginDto dto,
      HttpServletRequest servletRequest) {
    HttpServletRequest req = (HttpServletRequest) servletRequest;
    Optional<Employee> employeeOpt = employeeDao.get(dto.login());

    if (employeeOpt.isEmpty()) {
      throw  new RuntimeException("ex");
    }

    Employee employee = employeeOpt.get();
    if (employee.getLogin().equals(dto.login()) && employee.getPassword().equals(dto.password())) {
      HttpSession session = req.getSession(true);
      session.setMaxInactiveInterval(60 * 30 * 1000000);

      Optional<Machine> machineOpt = machineDao.getBySessionId(session.getId());
      if (machineOpt.isEmpty()) {
        throw new RuntimeException("e");
      }

      Machine machine = machineOpt.get();
      Employee authenticatedEmployee = employee.withMachineId(machine.getId());
      employeeDao.updateEmployee(authenticatedEmployee);
      return employeeDtoMapper.employeeToDto(authenticatedEmployee);
    }

    throw new RuntimeException("заглушка на auth ex");
  }
}