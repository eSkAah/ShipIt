import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UsersQueryDto extends PaginationQueryDto {}

export class OrganizationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['free', 'premium'], description: 'Filter by subscription tier' })
  @IsOptional()
  @IsString()
  tier?: 'free' | 'premium';
}

export class LogsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['info', 'warn', 'error', 'debug'],
    description: 'Filter by log level',
  })
  @IsOptional()
  @IsString()
  level?: string;
}

export class FeedbackQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['bug', 'help'],
    description: 'Filter by feedback type',
  })
  @IsOptional()
  @IsString()
  type?: 'bug' | 'help';
}
