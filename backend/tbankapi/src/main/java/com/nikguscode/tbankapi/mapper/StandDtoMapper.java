package com.nikguscode.tbankapi.mapper;

import com.nikguscode.tbankapi.dto.request.StandDto;
import com.nikguscode.tbankapi.model.stand.Stand;
import com.nikguscode.tbankapi.model.stand.StandActivityType;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StandDtoMapper {
  @Mapping(target = "id", source = "id")
  @Mapping(target = "name", source = "name")
  @Mapping(target = "activityType", source = "activityType")
  @Mapping(target = "startDateTime", source = "startDateTime")
  @Mapping(target = "endDateTime", source = "endDateTime")
  Stand dtoToStand(
      UUID id,
      String name,
      StandActivityType activityType,
      OffsetDateTime startDateTime,
      OffsetDateTime endDateTime);
}