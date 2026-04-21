import { IsString, IsDateString, IsEnum, IsBoolean, IsOptional, IsNumber, Min, IsArray } from 'class-validator';
import { LeaveType, LeaveStatus } from '../schemas/leave-request.schema';

export class CreateLeaveRequestDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @IsOptional()
  @IsString()
  halfDaySession?: string;

  @IsString()
  reason: string;
}

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class AdjustBalanceDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsNumber()
  amount: number;
}

export class UpdatePolicyDto {
  @IsArray()
  entitlements: { type: LeaveType; days: number }[];
}
