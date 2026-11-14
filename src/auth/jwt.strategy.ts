import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { redactAccount } from '../domain/identity-policy';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }
  async validate(payload: { sub?: string }) {
    if (typeof payload.sub !== 'string') throw new UnauthorizedException('Token inválido');
    const account = await this.prisma.account.findUnique({ where: { id: payload.sub } });
    if (!account) throw new UnauthorizedException('Cuenta inexistente o eliminada');
    return redactAccount(account);
  }
}
