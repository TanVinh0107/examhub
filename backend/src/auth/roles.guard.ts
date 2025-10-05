import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // nếu không set role thì route đó public
    }

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No user in request');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission');
    }
    return true;
  }
}
