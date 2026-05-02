import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

interface RedisError extends Error {
  code?: string | number;
}

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

        redis.on('connect', () => {
          console.log('[Redis] Connecting to server...');
        });

        redis.on('ready', () => {
          console.log('[Redis] Client is ready');
        });

        redis.on('error', (err) => {
          const redisErr = err as RedisError;
          console.error('[Redis] Connection error:', {
            message: redisErr.message,
            stack: redisErr.stack,
            code: redisErr.code,
          });
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
