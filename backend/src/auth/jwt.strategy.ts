import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // Chỉ chấp nhận token có type = 'access'
    if (payload?.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // req.user sẽ nhận object này
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
