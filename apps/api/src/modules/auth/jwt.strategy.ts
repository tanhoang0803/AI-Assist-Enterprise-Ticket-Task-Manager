import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppConfig } from '@config/configuration';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from './dto/jwt-payload.dto';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<AppConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKey: config.get('jwtSecret', { infer: true }) ?? 'dev-secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');
    return this.authService.validateAndSyncUser(payload);
  }
}
