package com.nikguscode.tbankapi.model.stand;

import lombok.Getter;

@Getter
public enum StandActivityType {
  GAME_PC("GAME_PC"),
  GAME_BOARD("GAME_BOARD"),
  VR_AR("VR_AR"),
  MASTERCLASS("MASTERCLASS"),
  QUIZ_QUEST("QUIZ_QUEST"),
  PHOTO_ZONE("PHOTO_ZONE");

  private final String dbValue;

  StandActivityType(String dbValue) {
    this.dbValue = dbValue;
  }
}