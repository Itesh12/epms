import { IsNotEmpty, IsString, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ProjectStatus, ProjectPriority } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

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
