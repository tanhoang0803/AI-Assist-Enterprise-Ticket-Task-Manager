import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, TicketPriority, TicketCategory } from '@repo/types';

export class UpdateTicketDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({ nullable: true, description: 'Pass null to unassign' })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601 date string. Pass null to clear.' })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
