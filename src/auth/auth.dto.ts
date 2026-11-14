import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistrationDto {
  @ApiProperty({ example: 'Nombre Completo' })
  @IsString() @MinLength(3) name!: string;

  @ApiProperty({ example: 'alguien@correo.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email!: string;

  @ApiProperty({ example: 'Clave123', minLength: 6, maxLength: 16 })
  @IsString() @MinLength(6) @MaxLength(16)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]+$/, { message: 'Se requiere mayúscula, minúscula, número y sin espacios' })
  password!: string;

  @ApiProperty({ example: 'Clave123' })
  @IsString() passwordconf!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional() @IsString() image?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'alguien@correo.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email!: string;
  @ApiProperty({ example: 'Clave123' })
  @IsString() password!: string;
}
