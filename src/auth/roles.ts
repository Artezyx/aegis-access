import { applyDecorators, SetMetadata, UseGuards, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { RoleGuard } from './roles.guard';

import { ROLE_METADATA } from './roles.constants';
export const Protected = (...roles: Role[]) => applyDecorators(
  SetMetadata(ROLE_METADATA, roles), UseGuards(AuthGuard('jwt'), RoleGuard),
);
export const LoggedInAccount = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
});
