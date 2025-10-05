package com.nikguscode.tbankapi.controller;

import com.nikguscode.tbankapi.dao.employee.EmployeeDao;
import com.nikguscode.tbankapi.dao.stand.StandDao;
import com.nikguscode.tbankapi.dto.request.StandDto;
import com.nikguscode.tbankapi.mapper.StandDtoMapper;
import com.nikguscode.tbankapi.mapper.StandDtoResponseMapper;
import com.nikguscode.tbankapi.model.employee.Role;
import com.nikguscode.tbankapi.model.stand.Stand;
import com.nikguscode.tbankapi.model.employee.Employee;
import com.nikguscode.tbankapi.model.stand.StandActivityType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/stands")
@CrossOrigin(origins = "http://127.0.0.1:5501", allowedHeaders = "*", allowCredentials = "true")
public class StandController {
  private final StandDao standDao;
  private final EmployeeDao employeeDao;
  private final StandDtoMapper standDtoMapper;
  private final StandDtoResponseMapper standDtoResponseMapper;

  public StandController(
      @Qualifier("jooqStandDao") StandDao standDao,
      @Qualifier("jooqEmployeeDao") EmployeeDao employeeDao,
      StandDtoMapper mapper,
      StandDtoResponseMapper standDtoResponseMapper) {
    this.standDao = standDao;
    this.employeeDao = employeeDao;
    this.standDtoMapper = mapper;
    this.standDtoResponseMapper = standDtoResponseMapper;
  }

  @PostMapping(consumes = "application/json")
  public String addStand(@RequestBody StandDto dto) {
    final UUID standId = UUID.randomUUID();

    Stand stand = standDtoMapper.dtoToStand(
        standId,
        dto.name(),
        StandActivityType.valueOf(dto.activityType()),
        OffsetDateTime.parse(dto.startDateTime()),
        OffsetDateTime.parse(dto.endDateTime()));
    standDao.add(stand);

    return standId.toString();
  }

  @PutMapping(value = "/{standId}", consumes = "application/json")
  public void updateStand(@RequestBody StandDto dto, @PathVariable UUID standId) {
    Stand stand = standDtoMapper.dtoToStand(
        standId,
        dto.name(),
        StandActivityType.valueOf(dto.activityType()),
        OffsetDateTime.parse(dto.startDateTime()),
        OffsetDateTime.parse(dto.endDateTime()));
    standDao.update(stand);
  }

  @DeleteMapping("/{standId}")
  public void deleteStand(@PathVariable UUID standId) {
    employeeDao.deleteByStandId(standId);
    standDao.delete(standId);
  }

  @GetMapping("/{standId}")
  public Stand getStand(@PathVariable UUID standId) {
    return standDao.getById(standId).get();
  }

  @GetMapping
  public List<com.nikguscode.tbankapi.dto.response.StandDto> getStands() {
    List<Stand> stands = standDao.getAll();
    List<Employee> employees = employeeDao.getAll();

    System.out.println(employees);

    return stands.stream().map(s -> {
      Employee employee = employees.stream()
          .filter(e -> !e.getRole().equals(Role.ADMIN) && e.getStandId().equals(s.getId()))
          .findFirst()
          .orElseThrow(() -> new IllegalStateException(
          "Для стенда с ID " + s.getId() + " не найден привязанный волонтер."));

      String employeeFullName = convertToFullName(
          employee.getFirstName(), employee.getSecondName(), employee.getLastName());

      return standDtoResponseMapper.fromStandAndVolunteerToResponseDto(s, employeeFullName);
    }).toList();
  }

  private String convertToFullName(String firstName, String secondName, String lastName) {
    return firstName + " " + secondName + " " + lastName;
  }
}