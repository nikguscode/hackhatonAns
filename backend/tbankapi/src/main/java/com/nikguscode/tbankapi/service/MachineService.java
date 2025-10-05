package com.nikguscode.tbankapi.service;

import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.model.Machine;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class MachineService {
  private final MachineDao machineDao;

  public MachineService(@Qualifier("jooqMachineDao") MachineDao machineDao) {
    this.machineDao = machineDao;
  }

  public Machine createNewSession(String sessionId) {
    OffsetDateTime now = OffsetDateTime.now();
    OffsetDateTime expiration = now.plusDays(1);

    Machine machine = new Machine(
        UUID.randomUUID(),
        sessionId,
        MachineUtilService.generateUniqueId(),
        MachineUtilService.generateGuestLoginCode(),
        now,
        expiration);
    machineDao.add(machine);
    return machine;
  }
}