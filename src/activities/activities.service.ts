import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Amadeus = require('amadeus');

import { GetActivityQueryDTO } from './dto/get-activity-query.dto';
import { ResponseActivitySearchDTO } from './dto/activity-search-response.dto';
import {
  Activities,
  ActivityType,
} from '../interfaces/activities/get-activities.interface';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivitiesService {
  private amadeus;
  constructor(
    @InjectRepository(Activity)
    private readonly ActivityRepo: Repository<Activity>,
  ) {
    this.amadeus = new Amadeus();
  }

  async activitySearch(
    getActivityQueryDTO: GetActivityQueryDTO,
  ): Promise<ResponseActivitySearchDTO[] | InternalServerErrorException> {
    const { latitude, longitude, radiusInKilometers } = getActivityQueryDTO;
    try {
      const {
        result: { data: activities },
      }: Activities = await this.amadeus.shopping.activities.get({
        latitude: latitude,
        longitude: longitude,
        radius: radiusInKilometers,
      });

      return activities.map((activity) =>
        this.activityResponse(ResponseActivitySearchDTO, activity),
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch activities');
    }
  }

  async getActivity(
    activityId: string,
  ): Promise<ResponseActivitySearchDTO | InternalServerErrorException> {
    try {
      const {
        result: { data: activity },
      }: Activities = await this.amadeus.shopping.activity(activityId).get();

      const activityResponse = this.activityResponse(
        ResponseActivitySearchDTO,
        activity,
      );
      this.saveActivity(activityResponse);
      return activityResponse;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch activity');
    }
  }

  private activityResponse<T>(
    DTOClass: new (partial: Partial<T>) => T,
    activity: ActivityType | ActivityType[],
  ): T {
    return plainToInstance(DTOClass, activity, {
      excludeExtraneousValues: true,
    });
  }

  private async saveActivity(activityData: ActivityType) {
    const newActivity = this.ActivityRepo.create({
      activityId: activityData.id,
      name: activityData.name,
      description: activityData.description,
      location: JSON.stringify(activityData.geoCode),
      price: +activityData.price?.amount || 0.0,
      currency: activityData.price?.currencyCode,
      pictures: activityData.pictures,
    });
    await this.ActivityRepo.save(newActivity);
  }
}
