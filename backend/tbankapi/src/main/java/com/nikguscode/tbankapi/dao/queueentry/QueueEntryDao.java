package com.nikguscode.tbankapi.dao.queueentry;

import com.nikguscode.tbankapi.model.queueentry.QueueEntry;
import java.util.List;
import java.util.UUID;

public interface QueueEntryDao {
  void add(QueueEntry queueEntry);

  void delete(UUID machineId, UUID standId);

  List<QueueEntry> getAll(UUID machineId);

  List<QueueEntry> getAllByStand(UUID standId);
}
