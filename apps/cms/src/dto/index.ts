import { RoleType, UPLOAD_TYPE_CMS } from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { Allow, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: RoleType;
}

export interface RequestUser extends Request {
  user: any;
}

export class TokenPayloadDto {
  readonly token: string;

  readonly expiresIn: number;

  readonly role: RoleType;

  constructor(token: string, expiresIn: number, role: RoleType) {
    this.token = token;
    this.expiresIn = expiresIn;
    this.role = role;
  }
}

export class SigninRequestDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}

export class PaginationDto {
  @Allow()
  @IsNumber()
  @IsOptional()
  page: number;

  @Allow()
  @IsNumber()
  @IsOptional()
  size: number;
}

export class UploadQueryDto {
  @IsNumber()
  @IsEnum(UPLOAD_TYPE_CMS, { message: VALIDATE_MESSAGE.UPLOAD.TYPE_INVALID })
  readonly type: number;
}
