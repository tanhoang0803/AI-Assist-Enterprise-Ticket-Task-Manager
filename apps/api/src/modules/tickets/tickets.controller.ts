import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser, type AuthUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@repo/types';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a ticket' })
  async create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthUser) {
    const result = await this.ticketsService.create(dto, user);
    await this.cache.clear();
    return result;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000)
  @ApiOperation({ summary: 'List tickets with filters and pagination' })
  findAll(@Query() query: TicketQueryDto) {
    return this.ticketsService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000)
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket — status transitions validated server-side' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.ticketsService.update(id, dto, user);
    await this.cache.clear();
    return result;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete ticket (ADMIN/MANAGER only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.ticketsService.remove(id, user.id);
    await this.cache.clear();
  }
}
