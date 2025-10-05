package com.nikguscode.tbankapi.mapper;

import com.nikguscode.tbankapi.dto.response.StandDto;
import com.nikguscode.tbankapi.model.stand.Stand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StandDtoResponseMapper {
  @Mapping(target = "employeeFullName", source = "employeeFullName")
  StandDto fromStandAndVolunteerToResponseDto(Stand stand, String employeeFullName);
}