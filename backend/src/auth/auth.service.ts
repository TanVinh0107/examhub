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
    // 1️⃣ Giải mã token và xác thực loại token
    const payload = await this.jwt.verifyAsync(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

    if (payload?.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 2️⃣ Kiểm tra token đã bị thu hồi chưa
    const revoked = await this.prisma.revokedToken.findUnique({
      where: { token: refreshToken },
    });
    if (revoked) {
      throw new UnauthorizedException('This refresh token has been revoked');
    }

    // 3️⃣ Lấy user từ DB
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        currentRefreshToken: true,
      },
    });

    // 4️⃣ Kiểm tra token có khớp DB không
    if (!user || user.currentRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 5️⃣ Nếu hợp lệ → cấp token mới
    return this.issueTokens(user.id, user.email, user.role);
  } catch (err) {
    console.warn('[SECURITY] Refresh failed:', err.message || err);
    throw new UnauthorizedException('Invalid or expired refresh token');
  }
}



  async logout(userId: string) {
  // Lấy refresh token hiện tại trước khi xóa
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { currentRefreshToken: true },
  });

  if (user?.currentRefreshToken) {
    await this.prisma.revokedToken.create({
      data: {
        token: user.currentRefreshToken,
        userId,
      },
    });
  }

  // Sau đó xoá refresh token trong bảng User
  await this.prisma.user.update({
    where: { id: userId },
    data: { currentRefreshToken: null },
  });

  return { message: 'Logged out successfully' };
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

    // 💾 Cập nhật refreshToken vào DB
    await this.prisma.user.update({
      where: { id: sub },
      data: { currentRefreshToken: refresh_token },
    });

    return { access_token, refresh_token };
  }
}
