import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WikiModule } from './modules/wiki/wiki.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    ProjectsModule,
    DashboardModule,
    UsersModule,
    AnalyticsModule,
    OrganizationsModule,
    TasksModule,
    AttendanceModule,
    CalendarModule,
    AnnouncementsModule,
    FinanceModule,
    AssetsModule,
    WikiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
