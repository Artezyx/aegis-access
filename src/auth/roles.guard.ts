import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLE_METADATA } from './roles.constants';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const accepted = this.reflector.getAllAndOverride<Role[]>(ROLE_METADATA, [context.getHandler(), context.getClass()]);
    if (!accepted?.length) return true;
    const user = context.switchToHttp().getRequest().user as { role: Role; email: string };
    if (user && accepted.includes(user.role)) return true;
    throw new ForbiddenException('Tu rol no permite acceder a esta operación');
  }
}
