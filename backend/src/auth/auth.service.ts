import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existed = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existed) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        name: dto.name ?? null,
      },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload?.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');

      return this.issueTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const accessTtl = this.config.get<string>('ACCESS_TOKEN_TTL') ?? '900'; // 15 phút
    const refreshTtl =
      this.config.get<string>('REFRESH_TOKEN_TTL') ?? '604800'; // 7 ngày

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        { sub, email, role, type: 'access' },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: Number(accessTtl),
        },
      ),
      this.jwt.signAsync(
        { sub, email, role, type: 'refresh' },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: Number(refreshTtl),
        },
      ),
    ]);

    return { access_token, refresh_token };
  }
}
