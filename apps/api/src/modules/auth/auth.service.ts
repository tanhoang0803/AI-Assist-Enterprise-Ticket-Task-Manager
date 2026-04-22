import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { UserRole } from '@repo/types';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called on every authenticated request.
   * Upserts the user so Auth0 users are auto-provisioned on first login.
   * Role always comes from the DB — never trusted from the token.
   */
  async validateAndSyncUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.upsert({
      where: { auth0Id: payload.sub },
      update: {
        email: payload.email ?? '',
        name: payload.name ?? payload.email ?? '',
        avatarUrl: payload.picture,
      },
      create: {
        auth0Id: payload.sub,
        email: payload.email ?? '',
        name: payload.name ?? payload.email ?? '',
        avatarUrl: payload.picture,
        role: UserRole.MEMBER,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sub: payload.sub,
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
