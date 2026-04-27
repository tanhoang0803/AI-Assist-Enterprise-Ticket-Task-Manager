import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { LogsService } from './logs.service';
import { LogQueryDto } from './dto/log-query.dto';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated activity log (filter by entityType + entityId)' })
  findAll(@Query() query: LogQueryDto) {
    return this.logsService.findAll(query);
  }
}
