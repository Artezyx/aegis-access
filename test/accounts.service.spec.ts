import { UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../src/accounts/accounts.service';

describe('AccountsService (autorización)', () => {
  let db: any;
  let service: AccountsService;
  beforeEach(() => {
    db = { account: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    service = new AccountsService(db);
  });
  const actor = { id: 'self', email: 'self@example.com', role: 'user' as const };
  it('rechaza lectura de cuenta ajena', async () => {
    await expect(service.findOne('id', 'other', actor)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.account.findUnique).not.toHaveBeenCalled();
  });
  it('rechaza eliminación de cuenta ajena', async () => {
    await expect(service.remove('email', 'other@example.com', actor)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.account.delete).not.toHaveBeenCalled();
  });
  it('devuelve mensaje al eliminar cuenta propia', async () => {
    db.account.delete.mockResolvedValue({});
    await expect(service.remove('id', 'self', actor)).resolves.toEqual({ message: 'User deleted' });
  });
});
