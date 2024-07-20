import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

import { GetActivityQueryDTO } from './dto/get-activity-query.dto';
import { ResponseActivitySearchDTO } from './dto/activity-search-response.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('search')
  async activitieSearch(
    @Query() getActivityQueryDTO: GetActivityQueryDTO,
  ): Promise<ResponseActivitySearchDTO[]> {
    return this.activitiesService.activitySearch(getActivityQueryDTO);
  }

  @Get(':activityId')
  async getActivity(
    @Param('activityId') activityId: string,
  ): Promise<ResponseActivitySearchDTO> {
    return this.activitiesService.getActivity(activityId);
  }
}
