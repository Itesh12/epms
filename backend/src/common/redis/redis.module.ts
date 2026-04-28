import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');
        const redis = redisUrl 
          ? new Redis(redisUrl, { maxRetriesPerRequest: null })
          : new Redis({
              host: configService.get<string>('redis.host'),
              port: configService.get<number>('redis.port'),
              maxRetriesPerRequest: null,
            });

        redis.on('error', (err) => {
          console.warn('[Redis] Connection error:', err.message);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
