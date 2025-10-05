package com.nikguscode.tbankapi.dao.stand;

import static org.jooq.generated.Tables.STAND;

import com.nikguscode.tbankapi.model.stand.Stand;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.generated.tables.records.StandRecord;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JooqStandDao implements StandDao {
  private final DSLContext dsl;

  @Override
  public void add(Stand stand) {
    try {
      StandRecord standRecord = dsl.newRecord(STAND, stand);
      standRecord.store();
    } catch (DuplicateKeyException e) {
      throw new RuntimeException("заглушка");
    }
  }

  @Override
  public void delete(UUID standId) {
    dsl.deleteFrom(STAND).where(STAND.ID.eq(standId)).execute();
  }

  @Override
  public void update(Stand stand) {
    StandRecord record = dsl.newRecord(STAND, stand);
    record.changed(true);
    record.update();
  }

  @Override
  public Optional<Stand> getById(UUID standId) {
    return dsl.selectFrom(STAND).where(STAND.ID.eq(standId)).fetchOptionalInto(Stand.class);
  }

  @Override
  public List<Stand> getAll() {
    return dsl.select(STAND).from(STAND).fetchInto(Stand.class);
  }
}