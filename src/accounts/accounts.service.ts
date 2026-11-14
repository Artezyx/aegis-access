import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { isOwnerOrAdmin, normalizeEmail, redactAccount, safeChanges } from '../domain/identity-policy';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';

type CurrentAccount = { id: string; email: string; role: Role };
type AccountLookup = 'id' | 'email';

@Injectable()
export class AccountsService {
  constructor(private readonly db: PrismaService) {}

  private uniqueError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new BadRequestException('User already exists');
      if (error.code === 'P2025') throw new BadRequestException('User not found');
    }
    throw error;
  }

  private access(actor: CurrentAccount, type: AccountLookup, key: string) {
    if (!isOwnerOrAdmin(actor, type, key)) throw new UnauthorizedException('Unauthorized');
  }
  private key(type: AccountLookup, value: string): Prisma.AccountWhereUniqueInput {
    return type === 'id' ? { id: value } : { email: normalizeEmail(value) };
  }

  async create(input: CreateAccountDto) {
    if (input.password !== input.passwordconf) throw new BadRequestException('Passwords do not match');
    try {
      const user = await this.db.account.create({ data: {
        name: input.name.trim(), email: normalizeEmail(input.email),
        image: input.image, role: input.role || Role.user,
        passwordHash: await bcrypt.hash(input.password, 12),
      }});
      return redactAccount(user);
    } catch (error: unknown) { this.uniqueError(error); }
  }

  async findAll() {
    const all = await this.db.account.findMany({ orderBy: { createdAt: 'asc' } });
    return all.map(redactAccount);
  }

  async findOne(type: AccountLookup, value: string, actor: CurrentAccount) {
    this.access(actor, type, value);
    const account = await this.db.account.findUnique({ where: this.key(type, value) });
    if (!account) throw new BadRequestException('User not found');
    return redactAccount(account);
  }

  async update(type: AccountLookup, value: string, input: UpdateAccountDto, actor: CurrentAccount) {
    this.access(actor, type, value);
    if (input.password !== undefined && input.password !== input.passwordconf) throw new BadRequestException('Passwords do not match');
    const clean = safeChanges(input, actor.role);
    const data: Prisma.AccountUpdateInput = {};
    if (clean.name !== undefined) data.name = clean.name.trim();
    if (clean.email !== undefined) data.email = normalizeEmail(clean.email);
    if (clean.image !== undefined) data.image = clean.image;
    if (clean.role !== undefined) data.role = clean.role;
    if (clean.password !== undefined) data.passwordHash = await bcrypt.hash(clean.password, 12);
    try {
      const changed = await this.db.account.update({ where: this.key(type, value), data });
      return redactAccount(changed);
    } catch (error: unknown) { this.uniqueError(error); }
  }

  async remove(type: AccountLookup, value: string, actor: CurrentAccount) {
    this.access(actor, type, value);
    try {
      await this.db.account.delete({ where: this.key(type, value) });
      return { message: 'User deleted' };
    } catch (error: unknown) { this.uniqueError(error); }
  }
}
