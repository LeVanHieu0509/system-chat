import { Order, UPLOAD_TYPE_APP } from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CommonPaginationResponseDto {
  readonly totalRecords: number;

  readonly page: number;
}

export class CommonResponseDto {
  readonly status: number;

  readonly message: string;
}

export class CommonStatusResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class PaginationDto {
  @Allow()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number;

  @Allow()
  @IsInt()
  @Min(10)
  @IsOptional()
  @Type(() => Number)
  size: number;
}

export class SearchDto extends PaginationDto {
  @IsString()
  @IsOptional()
  keyword: string;
}

export class UploadQueryDto {
  @IsEnum(UPLOAD_TYPE_APP, { message: VALIDATE_MESSAGE.UPLOAD.TYPE_INVALID })
  readonly type: number;
}

export class DateQueryDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly from: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly to: number;
}

export class ISODateQueryDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  readonly from: string;

  @IsOptional()
  @IsDateString()
  readonly to: string;
}

export class VersionQueryDto extends PaginationDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  version: string;
}

export class SortQueryDto {
  @IsOptional()
  sortKey: string;

  @ValidateIf(({ sortKey }: SortQueryDto) => !!sortKey)
  @IsIn([Order.ASC, Order.DESC])
  sortOrder: string;
}
