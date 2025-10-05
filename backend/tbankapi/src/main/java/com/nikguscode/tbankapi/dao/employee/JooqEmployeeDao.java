package com.nikguscode.tbankapi.dao.employee;

import static org.jooq.generated.Tables.EMPLOYEE;

import com.nikguscode.tbankapi.model.employee.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.generated.tables.records.EmployeeRecord;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JooqEmployeeDao implements EmployeeDao {
  private final DSLContext dsl;

  @Override
  public void add(Employee employee) {
    try {
      EmployeeRecord employeeRecord = dsl.newRecord(EMPLOYEE, employee);
      employeeRecord.store();
    } catch (DuplicateKeyException e) {
      throw new RuntimeException("заглушка");
    }
  }

  @Override
  public List<Employee> getAll() {
    return dsl.selectFrom(EMPLOYEE).fetchInto(Employee.class);
  }

  @Override
  public Optional<Employee> get(String login) {
    return dsl.select(EMPLOYEE)
        .from(EMPLOYEE)
        .where(EMPLOYEE.LOGIN.eq(login))
        .fetchOptionalInto(Employee.class);
  }

  @Override
  public void updateEmployee(Employee employee) {
    try {
      EmployeeRecord employeeRecord = dsl.newRecord(EMPLOYEE, employee);
      employeeRecord.changed(true);
      employeeRecord.update();
    } catch (DuplicateKeyException e) {
      throw new RuntimeException("заглушка");
    }
  }

  @Override
  public Optional<Employee> getByMachineId(UUID machineId) {
    return dsl.selectFrom(EMPLOYEE)
        .where(EMPLOYEE.MACHINE_ID.eq(machineId))
        .fetchOptionalInto(Employee.class);
  }

  @Override
  public void deleteByStandId(UUID standId) {
    dsl.deleteFrom(EMPLOYEE).where(EMPLOYEE.STAND_ID.eq(standId)).execute();
  }
}