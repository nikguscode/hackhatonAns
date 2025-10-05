package com.nikguscode.tbankapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TbankApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TbankApiApplication.class, args);

    System.out.println("SPRING_DATASOURCE_URL=" + System.getenv("SPRING_DATASOURCE_URL"));
    System.out.println("SPRING_DATASOURCE_USERNAME=" + System.getenv("SPRING_DATASOURCE_USERNAME"));
    System.out.println("SPRING_DATASOURCE_PASSWORD=" + System.getenv("SPRING_DATASOURCE_PASSWORD"));
    System.out.println("SPRING_PROFILES_ACTIVE=" + System.getenv("SPRING_PROFILES_ACTIVE"));

  }
}
