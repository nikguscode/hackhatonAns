package com.nikguscode.tbankapi.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/ping")
//@CrossOrigin(origins = "http://127.0.0.1:5501", allowedHeaders = "*", allowCredentials = "true")
public class PingController {
  @GetMapping
  public void ping() {}
}