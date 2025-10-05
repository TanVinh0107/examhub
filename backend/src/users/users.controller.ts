import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    // req.user đến từ JwtStrategy.validate
    const user = await this.usersService.findById(req.user.sub);
    if (!user) return { message: 'User not found' };
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
