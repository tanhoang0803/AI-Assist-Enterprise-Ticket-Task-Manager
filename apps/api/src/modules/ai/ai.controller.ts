import { Controller, Post, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PrismaService } from '@database/prisma/prisma.service';
import { TicketProducer } from './producers/ticket.producer';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly producer: TicketProducer,
    private readonly prisma: PrismaService,
  ) {}

  @Post('analyze/:ticketId')
  @ApiOperation({ summary: 'Manually trigger AI analysis for a ticket' })
  async analyze(@Param('ticketId') ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: { id: true, title: true, description: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    await this.producer.enqueueAnalysis(ticket.id, ticket.title, ticket.description);
    return { queued: true, ticketId };
  }
}
