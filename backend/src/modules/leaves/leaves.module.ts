import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { LeaveBalance, LeaveBalanceSchema } from './schemas/leave-balance.schema';
import { Attendance, AttendanceSchema } from '../attendance/schemas/attendance.schema';

import { LeavePolicy, LeavePolicySchema } from './schemas/leave-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
