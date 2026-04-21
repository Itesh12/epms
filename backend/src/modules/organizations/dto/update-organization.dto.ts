import { IsString, IsOptional, MaxLength, Matches, IsUrl, IsEmail, ValidateIf } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.logoUrl !== '')
  @IsUrl()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subtitle?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Primary color must be a valid hex code' })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Secondary color must be a valid hex code' })
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.website !== '')
  @IsUrl()
  website?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.contactEmail !== '')
  @IsEmail()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  size?: string;
}
