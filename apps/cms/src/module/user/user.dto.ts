import { RoleType, STATUS } from '@app/common';
import {
  Allow,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { PaginationDto } from '../../dto';

export class UserListResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class UserRequestDto {
  @IsNotEmpty()
  @IsString()
  readonly fullName: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  readonly phone: string;

  @IsOptional()
  @IsEnum(RoleType)
  role: number;

  @IsOptional()
  @IsEnum(STATUS)
  status: number;

  @IsOptional()
  @IsUrl()
  readonly avatar: string;
}

export class RegisterUserRequestDto extends UserRequestDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]*$/gm)
  readonly userName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserResponseDto {
  readonly id: string;

  readonly userName: string;

  readonly fullName: string;

  readonly email: string;

  readonly phone: string;

  readonly avatar: string;

  readonly role: number;

  readonly status: number;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  readonly createdBy: number;
}

export class UserQuerySearchDto extends PaginationDto {
  @Allow()
  userName: string;

  @Allow()
  fullName: string;

  @Allow()
  keyword: string;

  @Allow()
  @IsNumber()
  @IsOptional()
  role: number;

  @Allow()
  @IsOptional()
  @IsNumber()
  status: number;

  @Allow()
  @IsOptional()
  @IsNumber()
  createdBy: number;

  @Allow()
  @IsOptional()
  createdAt: string;
}

export class UserParamsDto {
  @Allow()
  readonly id: string;
}

export class AdminResetPasswordRequestDto {
  @IsOptional()
  readonly password: string;
}

export class PasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  password?: string;
}
