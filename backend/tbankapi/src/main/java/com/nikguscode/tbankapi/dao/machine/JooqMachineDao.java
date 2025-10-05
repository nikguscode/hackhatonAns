package com.nikguscode.tbankapi.dao.machine;

import static org.jooq.generated.Tables.MACHINE;

import com.nikguscode.tbankapi.model.Machine;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.generated.tables.records.MachineRecord;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JooqMachineDao implements MachineDao {
  private final DSLContext dsl;

  @Override
  public void add(Machine machine) {
    try {
      MachineRecord record = dsl.newRecord(MACHINE, machine);
      record.store();
    } catch (DuplicateKeyException e) {
      throw new RuntimeException("zagl");
    }
  }

  @Override
  public Optional<Machine> getBySessionId(String sessionId) {
    return dsl.selectFrom(MACHINE)
        .where(MACHINE.SESSION_ID.eq(sessionId))
        .fetchOptionalInto(Machine.class);
  }

  @Override
  public Optional<Machine> getById(UUID id) {
    return dsl.selectFrom(MACHINE)
        .where(MACHINE.ID.eq(id))
        .fetchOptionalInto(Machine.class);
  }
}