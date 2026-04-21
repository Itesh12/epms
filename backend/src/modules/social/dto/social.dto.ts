import { IsString, IsArray, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SocialPostType } from '../schemas/social-post.schema';

export class CreateSocialPostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsEnum(SocialPostType)
  type?: SocialPostType;
}

export class UpdateSocialPostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class CreateSocialCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
