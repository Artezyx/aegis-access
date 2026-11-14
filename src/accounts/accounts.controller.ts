import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LoggedInAccount, Protected } from '../auth/roles';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { AccountsService } from './accounts.service';

type Principal = { id: string; email: string; role: Role };

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Post() @Protected(Role.admin)
  @ApiOperation({ summary: 'Administrador: crear usuario y asignar rol' })
  create(@Body() input: CreateAccountDto) { return this.accounts.create(input); }

  @Get() @Protected(Role.admin)
  @ApiOperation({ summary: 'Administrador: consultar todas las cuentas' })
  all() { return this.accounts.findAll(); }

  @Get('email/:email') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Consultar por email, propio o admin' })
  byEmail(@Param('email') email: string, @LoggedInAccount() actor: Principal) {
    return this.accounts.findOne('email', email, actor);
  }

  @Get(':id') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Consultar por UUID, propio o admin' })
  byId(@Param('id') id: string, @LoggedInAccount() actor: Principal) {
    return this.accounts.findOne('id', id, actor);
  }

  @Patch('email/:email') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Modificar por email, propio o admin' })
  editByEmail(@Param('email') email: string, @Body() input: UpdateAccountDto, @LoggedInAccount() actor: Principal) {
    return this.accounts.update('email', email, input, actor);
  }

  @Patch(':id') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Modificar por UUID, propio o admin' })
  editById(@Param('id') id: string, @Body() input: UpdateAccountDto, @LoggedInAccount() actor: Principal) {
    return this.accounts.update('id', id, input, actor);
  }

  @Delete('email/:email') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Eliminar por email, propio o admin' })
  deleteByEmail(@Param('email') email: string, @LoggedInAccount() actor: Principal) {
    return this.accounts.remove('email', email, actor);
  }

  @Delete(':id') @Protected(Role.admin, Role.user)
  @ApiOperation({ summary: 'Eliminar por UUID, propio o admin' })
  deleteById(@Param('id') id: string, @LoggedInAccount() actor: Principal) {
    return this.accounts.remove('id', id, actor);
  }
}
