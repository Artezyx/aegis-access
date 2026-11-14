import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeEmail, redactAccount } from '../domain/identity-policy';
import { LoginDto, RegistrationDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService, private readonly jwt: JwtService) {}

  async register(input: RegistrationDto) {
    if (input.password !== input.passwordconf) throw new BadRequestException('Passwords do not match');
    const email = normalizeEmail(input.email);
    try {
      const account = await this.db.account.create({
        data: { name: input.name.trim(), email, passwordHash: await bcrypt.hash(input.password, 12), image: input.image },
      });
      return { user: redactAccount(account), token: await this.issueToken(account.id) };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new BadRequestException('User already exists');
      throw error;
    }
  }

  async login(input: LoginDto) {
    const account = await this.db.account.findUnique({ where: { email: normalizeEmail(input.email) } });
    if (!account || !(await bcrypt.compare(input.password, account.passwordHash))) {
      throw new BadRequestException('Wrong credentials');
    }
    return { user: redactAccount(account), token: await this.issueToken(account.id) };
  }

  async refresh(account: { id: string }) {
    return { user: account, token: await this.issueToken(account.id) };
  }

  private issueToken(id: string) { return this.jwt.signAsync({ sub: id }); }
}
