package com.nikguscode.tbankapi.dto.request;

public record LoginDto(
    String login,
    String password
) {}