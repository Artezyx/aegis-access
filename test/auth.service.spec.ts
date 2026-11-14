import { BadRequestException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService (acceso y seguridad)', () => {
  const issueToken = { signAsync: jest.fn().mockResolvedValue('signed.jwt') };
  let db: any;
  let service: AuthService;
  beforeEach(() => {
    db = { account: { create: jest.fn(), findUnique: jest.fn() } };
    service = new AuthService(db, issueToken as any);
  });
  it('rechaza registro con confirmación diferente', async () => {
    await expect(service.register({ name: 'Ana Test', email: 'ana@example.com', password: 'Prueba123', passwordconf: 'Otra123' })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.account.create).not.toHaveBeenCalled();
  });
  it('rechaza inicio de sesión con cuenta inexistente', async () => {
    db.account.findUnique.mockResolvedValue(null);
    await expect(service.login({ email: 'falso@example.com', password: 'Prueba123' })).rejects.toBeInstanceOf(BadRequestException);
  });
  it('renueva token para usuario válido', async () => {
    expect(await service.refresh({ id: 'uuid-1' })).toEqual({ user: { id: 'uuid-1' }, token: 'signed.jwt' });
  });
});
