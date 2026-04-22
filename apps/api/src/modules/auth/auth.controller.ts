import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '@common/decorators/current-user.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }
}
