import { IsNotEmpty, IsString, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ProjectStatus } from '../schemas/project.schema';

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
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];
}
