import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export default {
  imports: [ConfigModule],
  inject: [ConfigService],
  isGlobal: true,
  useFactory: async (configService: ConfigService) => ({
    ttl: 3600,
    store: await redisStore({
      url: configService.get<string>('REDIS_STORE_URL'),
    }),
  }),
};
