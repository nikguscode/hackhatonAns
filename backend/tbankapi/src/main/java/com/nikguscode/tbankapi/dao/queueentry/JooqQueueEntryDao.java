package com.nikguscode.tbankapi.dao.queueentry;

import static org.jooq.generated.Tables.QUEUE_ENTRY;

import com.nikguscode.tbankapi.model.queueentry.QueueEntry;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.generated.tables.records.QueueEntryRecord;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JooqQueueEntryDao implements QueueEntryDao {
  private final DSLContext dsl;

  @Override
  public void add(QueueEntry queueEntry) {
    try {
      QueueEntryRecord record = dsl.newRecord(QUEUE_ENTRY, queueEntry);
      record.store();
    } catch (DuplicateKeyException e) {
      throw new RuntimeException("заглушка");
    }
  }

  @Override
  public void delete(UUID machineId, UUID standId) {
    dsl.deleteFrom(QUEUE_ENTRY)
        .where(QUEUE_ENTRY.MACHINE_ID.eq(machineId).and(QUEUE_ENTRY.STAND_ID.eq(standId)))
        .execute();
  }

  @Override
  public List<QueueEntry> getAll(UUID machineId) {
    return dsl.selectFrom(QUEUE_ENTRY)
        .where(QUEUE_ENTRY.MACHINE_ID.eq(machineId))
        .fetchInto(QueueEntry.class);
  }

  @Override
  public List<QueueEntry> getAllByStand(UUID standId) {
    return dsl.selectFrom(QUEUE_ENTRY)
        .where(QUEUE_ENTRY.STAND_ID.eq(standId))
        .fetchInto(QueueEntry.class);
  }
}