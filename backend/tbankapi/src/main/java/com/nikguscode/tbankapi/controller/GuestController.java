package com.nikguscode.tbankapi.controller;

import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.dao.queueentry.QueueEntryDao;
import com.nikguscode.tbankapi.dao.stand.StandDao;
import com.nikguscode.tbankapi.dto.response.QueueEntryDto;
import com.nikguscode.tbankapi.model.Machine;
import com.nikguscode.tbankapi.model.queueentry.QueueEntry;
import com.nikguscode.tbankapi.model.queueentry.QueueEntryStatus;
import com.nikguscode.tbankapi.model.stand.Stand;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/guest")
public class GuestController {
  private final QueueEntryDao queueEntryDao;
  private final MachineDao machineDao;
  private final StandDao standDao;

  public GuestController(
      @Qualifier("jooqQueueEntryDao") QueueEntryDao queueEntryDao,
      @Qualifier("jooqMachineDao") MachineDao machineDao,
      @Qualifier("jooqStandDao") StandDao standDao) {
    this.queueEntryDao = queueEntryDao;
    this.machineDao = machineDao;
    this.standDao = standDao;
  }

  @GetMapping
  public Machine getMachine(
      @CookieValue(value = "JSESSIONID", required = false) String sessionId) {
    Optional<Machine> machine = machineDao.getBySessionId(sessionId);

    if (machine.isEmpty()) {
      throw new RuntimeException("ex");
    }

    return machine.get();
  }

  @PostMapping("/stands/{standId}")
  public String joinToQueue(
      @CookieValue(value = "JSESSIONID", required = false) String sessionId,
      @PathVariable UUID standId) {
    Optional<Machine> machine = machineDao.getBySessionId(sessionId);

    if (machine.isEmpty()) {
      throw new RuntimeException("заглушка");
    }

    List<QueueEntry> queueEntries = queueEntryDao.getAll(machine.get().getId());
    queueEntries.stream()
        .filter(qE -> qE.getStandId().equals(standId))
        .findAny()
        .ifPresent(e -> {
          throw new RuntimeException("");
        });

    QueueEntry queueEntry = QueueEntry.builder()
        .id(UUID.randomUUID())
        .standId(standId)
        .machineId(machine.get().getId())
        .queuedAt(OffsetDateTime.now())
        .queueEntryStatus(QueueEntryStatus.WAITING)
        .build();

    queueEntryDao.add(queueEntry);
    return "ok";
  }

  @DeleteMapping("/stands/{standId}")
  public void deleteQueueEntry(
      @CookieValue(value = "JSESSIONID", required = false) String sessionId,
      @PathVariable UUID standId) {
    Optional<Machine> machineOpt = machineDao.getBySessionId(sessionId);

    if (machineOpt.isEmpty()) {
      throw new RuntimeException("runex");
    }

    queueEntryDao.delete(machineOpt.get().getId(), standId);
  }

  @GetMapping("/stands")
  public List<QueueEntryDto> getAllQueueEntries(
      @CookieValue(value = "JSESSIONID", required = false) String sessionId) {
    Optional<Machine> machineOpt = machineDao.getBySessionId(sessionId);

    if (machineOpt.isEmpty()) {
      throw new RuntimeException("заглушка");
    }

    Machine machine = machineOpt.get();
    List<QueueEntry> queueEntries = queueEntryDao.getAll(machine.getId());

    return queueEntries.stream().map(qE -> {
      Optional<Stand> standOpt = standDao.getById(qE.getStandId());

      if (standOpt.isEmpty()) {
        throw new RuntimeException("zagl");
      }

      Stand stand = standOpt.get();
      return new QueueEntryDto(
          qE.getId(), stand.getId(), stand.getName(), stand.getActivityType().getDbValue(),
          qE.getQueuedAt().toString());
    }).toList();
  }
}