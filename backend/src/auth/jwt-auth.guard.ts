import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new UnauthorizedException('Bạn chưa đăng nhập hoặc token không hợp lệ');
    }
    return user;
  }
}
