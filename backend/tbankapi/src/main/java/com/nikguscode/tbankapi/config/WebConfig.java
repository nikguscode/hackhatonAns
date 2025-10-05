package com.nikguscode.tbankapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    // Разрешить CORS для всех путей в приложении
    registry.addMapping("/**")
        // Разрешаем ТОЛЬКО ваш фронтенд, так как включен allowCredentials(true)
        .allowedOrigins("http://127.0.0.1:5501")
        // Разрешить все основные HTTP методы (GET, POST, PUT, DELETE...)
        .allowedMethods("*")
        // Разрешить все заголовки
        .allowedHeaders("*")
        // Разрешить передачу учетных данных (куки, заголовки авторизации)
        .allowCredentials(true)
        // Кэшировать настройки CORS на 30 минут
        .maxAge(1800);
  }
}