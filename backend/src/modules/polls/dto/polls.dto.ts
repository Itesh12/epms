import { IsString, IsArray, IsOptional, IsDateString, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { FeedbackStatus } from '../schemas/feedback.schema';

export class CreatePollDto {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}

export class VoteDto {
  @IsNumber()
  @Min(0)
  optionIndex: number;
}

export class CreateFeedbackDto {
  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsBoolean()
  isAnonymous: boolean;
}

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
