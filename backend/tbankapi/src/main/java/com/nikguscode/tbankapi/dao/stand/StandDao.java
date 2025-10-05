package com.nikguscode.tbankapi.dao.stand;

import com.nikguscode.tbankapi.model.stand.Stand;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StandDao {
  void add(Stand stand);

  void delete(UUID standId);

  void update(Stand stand);

  Optional<Stand> getById(UUID standId);

  List<Stand> getAll();
}