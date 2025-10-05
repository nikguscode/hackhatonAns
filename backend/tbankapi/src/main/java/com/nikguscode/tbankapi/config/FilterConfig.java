package com.nikguscode.tbankapi.config;

import com.nikguscode.tbankapi.controller.filter.GuestFilter;
import com.nikguscode.tbankapi.controller.filter.RedirectFilter;
import com.nikguscode.tbankapi.dao.machine.MachineDao;
import com.nikguscode.tbankapi.service.MachineService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
  @Bean
  public FilterRegistrationBean<RedirectFilter> redirectFilter() {
    FilterRegistrationBean<RedirectFilter> registration = new FilterRegistrationBean<>();

    registration.setFilter(new RedirectFilter());
    registration.addUrlPatterns("/*");
    registration.setOrder(1);
    return registration;
  }

  @Bean
  public FilterRegistrationBean<GuestFilter> guestInitFilter(
      MachineService machineService, @Qualifier("jooqMachineDao") MachineDao machineDao) {
    FilterRegistrationBean<GuestFilter> registration = new FilterRegistrationBean<>();

    registration.setFilter(new GuestFilter(machineService, machineDao));
    registration.addUrlPatterns("/api/guest");
    registration.setOrder(2);
    return registration;
  }
}