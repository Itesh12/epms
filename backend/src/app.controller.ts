import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Redis } from 'ioredis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private connection: Connection,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      // Actually verify the database connection
      if ((this.connection.readyState as number) === 1 && this.connection.db) {
        await this.connection.db.admin().ping();
        dbStatus = 'up';
      }
    } catch {
      dbStatus = 'down';
    }

    try {
      // Actually verify the Redis connection
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'up';
      }
    } catch {
      redisStatus = 'down';
    }

    return {
      status:
        dbStatus === 'up' && redisStatus === 'up' ? 'up' : 'partially_down',
      checks: {
        database: dbStatus,
        redis: redisStatus,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
