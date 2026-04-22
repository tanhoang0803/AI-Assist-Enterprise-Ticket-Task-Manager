import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import type { AppConfig } from '@config/configuration';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import type { JwtPayload } from './dto/jwt-payload.dto';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService<AppConfig>,
    private readonly authService: AuthService,
  ) {
    const domain = config.get('auth0', { infer: true })?.domain ?? '';
    const audience = config.get('auth0', { infer: true })?.audience ?? '';

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');

    try {
      return await this.authService.validateAndSyncUser(payload);
    } catch (err) {
      this.logger.error('User sync failed', err);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
