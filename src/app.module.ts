import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@ApiTags('Status')
@Controller()
class StatusController {
  @Get()
  @ApiOperation({ summary: 'Comprueba si la API responde' })
  health() { return { ok: true, message: 'API is working' }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, unknown>) => {
        for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
          if (typeof env[key] !== 'string' || !(env[key] as string).trim()) throw new Error(`Falta ${key}`);
        }
        if ((env.JWT_SECRET as string).length < 32) throw new Error('JWT_SECRET requiere al menos 32 caracteres');
        return env;
      },
    }),
    PrismaModule, AuthModule, AccountsModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}
