package com.nikguscode.tbankapi.dao.machine;

import com.nikguscode.tbankapi.model.Machine;
import java.util.Optional;
import java.util.UUID;

public interface MachineDao {
  void add(Machine machine);

  Optional<Machine> getBySessionId(String sessionId);

  Optional<Machine> getById(UUID id);
}