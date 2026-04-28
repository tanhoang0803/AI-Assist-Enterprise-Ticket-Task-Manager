import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ticketId: string,
    file: Express.Multer.File,
    uploadedById: string,
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: { id: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    return this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${ticketId}/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById,
        ticketId,
      },
    });
  }

  findByTicket(ticketId: string) {
    return this.prisma.attachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!attachment) throw new NotFoundException(`Attachment ${id} not found`);
    await this.prisma.attachment.delete({ where: { id } });
  }
}
