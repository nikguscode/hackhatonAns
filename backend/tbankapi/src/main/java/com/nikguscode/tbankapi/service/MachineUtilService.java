package com.nikguscode.tbankapi.service;

import java.security.SecureRandom;
import java.util.Random;

public class MachineUtilService {
  private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static final int ID_LENGTH = 10;
  private static final int GUEST_LOGIN_LENGTH = 6;

  private static final Random RANDOM = new SecureRandom();

  /**
   * Генерирует случайный ID длиной 10 символов (буквы A-Z + цифры 0-9).
   * @return Случайная строка ID
   */
  public static String generateUniqueId() {
    StringBuilder sb = new StringBuilder(ID_LENGTH);

    for (int i = 0; i < ID_LENGTH; i++) {
      int randomIndex = RANDOM.nextInt(CHARACTERS.length());
      sb.append(CHARACTERS.charAt(randomIndex));
    }

    return sb.toString();
  }


  /**
   * Генерирует случайный логин гостя длиной 6 символов (буквы A-Z + цифры 0-9).
   * ПРИМЕЧАНИЕ: Для гарантии уникальности этот код должен быть проверен в базе данных.
   * @return Случайная строка логина гостя
   */
  public static String generateGuestLoginCode() {
    StringBuilder sb = new StringBuilder(GUEST_LOGIN_LENGTH);

    for (int i = 0; i < GUEST_LOGIN_LENGTH; i++) {
      int randomIndex = RANDOM.nextInt(CHARACTERS.length());
      sb.append(CHARACTERS.charAt(randomIndex));
    }

    return sb.toString();
  }
}