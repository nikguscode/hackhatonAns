package com.nikguscode.tbankapi.controller;

import com.nikguscode.tbankapi.dao.employee.EmployeeDao;
import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.dao.queueentry.QueueEntryDao;
import com.nikguscode.tbankapi.dto.request.EmployeeDto;
import com.nikguscode.tbankapi.mapper.EmployeeDtoMapper;
import com.nikguscode.tbankapi.model.Machine;
import com.nikguscode.tbankapi.model.employee.Employee;
import com.nikguscode.tbankapi.model.employee.Role;
import com.nikguscode.tbankapi.model.queueentry.QueueEntry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/employees")
@CrossOrigin(origins = "http://127.0.0.1:5501", allowedHeaders = "*", allowCredentials = "true")
public class EmployeeController {
  private final EmployeeDao employeeDao;
  private final MachineDao machineDao;
  private final QueueEntryDao queueEntryDao;
  private final EmployeeDtoMapper employeeDtoMapper;

  public EmployeeController(
      @Qualifier("jooqMachineDao") MachineDao machineDao,
      @Qualifier("jooqEmployeeDao") EmployeeDao employeeDao,
      @Qualifier("jooqQueueEntryDao") QueueEntryDao queueEntryDao,
      EmployeeDtoMapper employeeDtoMapper) {
    this.machineDao = machineDao;
    this.employeeDao = employeeDao;
    this.queueEntryDao = queueEntryDao;
    this.employeeDtoMapper = employeeDtoMapper;
  }

  @PostMapping
  public String addEmployee(@RequestBody EmployeeDto dto) {
    Employee employee = employeeDtoMapper.dtoToEmployee(UUID.randomUUID(), dto, Role.VOLUNTEER);
    employeeDao.add(employee);
    return "ok";
  }

  @GetMapping("/stand")
  public List<Machine> getAllMachinesByStand(
      @CookieValue(value = "JSESSIONID", required = false) String sessionId) {
    Optional<Machine> machineOpt = machineDao.getBySessionId(sessionId);

    if (machineOpt.isEmpty()) {
      throw new RuntimeException("ex");
    }
    Machine machine = machineOpt.get();
    Optional<Employee> employeeOpt = employeeDao.getByMachineId(machine.getId());

    if (employeeOpt.isEmpty()) {
      throw new RuntimeException("ex");
    }
    Employee employee = employeeOpt.get();
    System.out.println(employee);

    List<QueueEntry> queueEntries = queueEntryDao.getAllByStand(employee.getStandId());
    System.out.println(queueEntries);
    return queueEntries.stream()
        .flatMap(qE -> {
          Optional<Machine> currStandMachineOpt = machineDao.getById(qE.getMachineId());
          return currStandMachineOpt.stream();
        }).toList();
  }
}