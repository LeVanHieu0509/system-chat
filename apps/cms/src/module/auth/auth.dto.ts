import { RoleType } from '@app/common';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class TokenPayloadDto {
  readonly token: string;

  readonly expiresIn: number;

  readonly role: RoleType;

  readonly fullName: string;

  readonly phone: string;

  readonly email: string;

  readonly id: string;

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

export class ForgotPasswordRequestDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class CheckTokenRequestDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly token: string;
}

export class CommonResponseDto {
  readonly status: boolean;
}

export class ResetPasswordResponse extends CommonResponseDto {
  readonly token: string;
}

export class ResetPasswordRequestDto extends ForgotPasswordRequestDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly password: string;
}

export class ChangePasswordResponseDto {
  readonly id: string;

  readonly updatedAt: Date;
}

export class UserProfileRequestDto {
  @IsNotEmpty()
  @IsString()
  readonly fullName: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly avatar: string;
}
