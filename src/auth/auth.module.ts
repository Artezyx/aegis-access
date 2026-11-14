import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RoleGuard } from './roles.guard';

@Module({
  imports: [PassportModule, JwtModule.registerAsync({
    imports: [ConfigModule], inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '2h') as '2h' },
    }),
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RoleGuard],
  exports: [AuthService, PassportModule, JwtModule, RoleGuard],
})
export class AuthModule {}
