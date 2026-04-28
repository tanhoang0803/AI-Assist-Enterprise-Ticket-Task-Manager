import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '@common/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';

const ALLOWED_EXT = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|csv|xlsx|zip)$/i;

const multerStorage = diskStorage({
  destination: (req: Express.Request & { params?: Record<string, string> }, _file, cb) => {
    const dir = join(process.cwd(), 'uploads', req.params?.['ticketId'] ?? 'unknown');
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + extname(file.originalname));
  },
});

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('tickets/:ticketId/attachments')
  @ApiOperation({ summary: 'Upload a file attachment to a ticket (max 10 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_EXT.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'), false);
        }
      },
    }),
  )
  upload(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.attachmentsService.create(ticketId, file, user.id);
  }

  @Get('tickets/:ticketId/attachments')
  @ApiOperation({ summary: 'List attachments for a ticket' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.attachmentsService.findByTicket(ticketId);
  }

  @Delete('attachments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attachment' })
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
