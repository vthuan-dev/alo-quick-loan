import { IsString, IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class AdminCreateDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'])
  role: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}

export class AdminUpdateDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'])
  @IsOptional()
  role?: string;

  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}

export class AdminLoginResponseDto {
  accessToken: string;
  admin: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export class AdminProfileDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  permissions: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
