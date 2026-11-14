import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegistrationDto } from './auth.dto';
import { LoggedInAccount, Protected } from './roles';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Alta de cuenta con rol user' })
  register(@Body() input: RegistrationDto) { return this.auth.register(input); }

  @Post('login') @HttpCode(200)
  @ApiOperation({ summary: 'Inicio de sesión con JWT' })
  login(@Body() input: LoginDto) { return this.auth.login(input); }

  @Get('refresh-token') @Protected() @ApiBearerAuth()
  @ApiOperation({ summary: 'Emite un nuevo JWT para la sesión' })
  refresh(@LoggedInAccount() account: { id: string }) { return this.auth.refresh(account); }
}
