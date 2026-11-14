import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationDto } from '../auth/auth.dto';

export class CreateAccountDto extends RegistrationDto {
  @ApiPropertyOptional({ enum: Role, example: Role.user })
  @IsOptional() @IsEnum(Role) role?: Role;
}
export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional({ description: 'Compatibilidad con clientes que envían updatedAt; campo gestionado por la base de datos' })
  @IsOptional() @IsString() updatedAt?: string;
}
