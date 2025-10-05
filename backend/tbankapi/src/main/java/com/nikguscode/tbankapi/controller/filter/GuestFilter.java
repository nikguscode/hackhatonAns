package com.nikguscode.tbankapi.controller.filter;

import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.model.Machine;
import com.nikguscode.tbankapi.service.MachineService;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class GuestFilter implements Filter {
  private final MachineService machineService;
  private final MachineDao machineDao;

  public GuestFilter(
      MachineService machineService,
      @Qualifier("jooqMachineDao") MachineDao machineDao) {
    this.machineService = machineService;
    this.machineDao = machineDao;
  }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    Filter.super.init(filterConfig);
  }

  @Override
  public void destroy() {
    Filter.super.destroy();
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
      FilterChain filterChain) throws IOException, ServletException {
    HttpServletRequest req = (HttpServletRequest) servletRequest;

    HttpSession session = req.getSession(true);
    session.setMaxInactiveInterval((int) TimeUnit.HOURS.toSeconds(24));

    String jSessionId = session.getId();
    boolean needsNewDbEntry = true;

    try {
      Optional<Machine> machineOpt = machineDao.getBySessionId(jSessionId);

      if (machineOpt.isPresent()) {
        needsNewDbEntry = false;
        System.out.println("DEBUG: JSESSIONID found and valid in DB: " + jSessionId);
      } else {
        System.out.println("DEBUG: JSESSIONID expired or not found in DB: " + jSessionId);
      }
    } catch (Exception e) {
      System.err.println("Database error during session check: " + e.getMessage());
    }

    if (needsNewDbEntry) {
      Machine newMachine = machineService.createNewSession(jSessionId);
      System.out.println("DEBUG: New DB entry created/updated for JSESSIONID: " + newMachine.getSessionId());
    }

    filterChain.doFilter(servletRequest, servletResponse);
  }
}