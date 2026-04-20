import { IsString, IsOptional, IsEnum, IsArray, IsMongoId } from 'class-validator';

export class CreateWikiCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class CreateWikiArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED'])
  status?: string;
}

export class UpdateWikiArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED'])
  status?: string;
}
