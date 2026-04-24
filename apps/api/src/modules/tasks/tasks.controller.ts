import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('tickets/:ticketId/tasks')
  @ApiOperation({ summary: 'List tasks for a ticket' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.tasksService.findByTicket(ticketId);
  }

  @Post('tickets/:ticketId/tasks')
  @ApiOperation({ summary: 'Create a task under a ticket' })
  create(@Param('ticketId') ticketId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(ticketId, dto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task title or status' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
