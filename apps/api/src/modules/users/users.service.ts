import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { UserRole } from '@repo/types';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requester: AuthUser) {
    if (requester.role !== UserRole.ADMIN && requester.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    if (dto.role !== undefined && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change roles');
    }

    const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`User ${id} not found`);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.userSelect,
    });
  }

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: this.userSelect,
    });
  }
}
