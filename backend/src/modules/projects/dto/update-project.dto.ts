import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ProjectStatus } from '../schemas/project.schema';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];
}

