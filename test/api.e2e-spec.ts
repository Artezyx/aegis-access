import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';

type StoredAccount = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  image: string | null;
  emailVerified: Date | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Base de datos de prueba en memoria: verifica HTTP/JWT/RBAC sin borrar datos reales. */
class FakeDatabase {
  readonly rows = new Map<string, StoredAccount>();
  private locate(where: { id?: string; email?: string }) {
    return [...this.rows.values()].find((row) =>
      where.id !== undefined ? row.id === where.id : row.email === where.email,
    );
  }
  account = {
    create: async ({ data }: { data: Partial<StoredAccount> & { name: string; email: string; passwordHash: string } }) => {
      const now = new Date();
      const row: StoredAccount = {
        id: randomUUID(), name: data.name, email: data.email,
        passwordHash: data.passwordHash, role: data.role ?? 'user',
        image: data.image ?? null, emailVerified: null, createdAt: now, updatedAt: now,
      };
      this.rows.set(row.id, row);
      return row;
    },
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => this.locate(where) || null,
    findMany: async () => [...this.rows.values()],
    update: async ({ where, data }: { where: { id?: string; email?: string }; data: Partial<StoredAccount> }) => {
      const row = this.locate(where);
      if (!row) throw new Error('Missing test row');
      Object.assign(row, data, { updatedAt: new Date() });
      return row;
    },
    delete: async ({ where }: { where: { id?: string; email?: string } }) => {
      const row = this.locate(where);
      if (!row) throw new Error('Missing test row');
      this.rows.delete(row.id);
      return row;
    },
  };
}

describe('Aegis Access HTTP contract', () => {
  let app: INestApplication;
  let db: FakeDatabase;
  let userToken: string;
  let adminToken: string;
  let ownId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'this-is-a-throwaway-test-secret-not-for-production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/not_used';
    // Importar el módulo después de configurar el entorno: ConfigModule valida al importarse.
    const { AppModule } = await import('../src/app.module');
    db = new FakeDatabase();
    await db.account.create({ data: {
      name: 'Admin de pruebas', email: 'admin@example.com', role: 'admin',
      passwordHash: await bcrypt.hash('Admin123', 10),
    }});
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(db)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('GET /api/v1 status', () => request(app.getHttpServer()).get('/api/v1').expect(200, { ok: true, message: 'API is working' }));

  it('registration creates a normal user and never returns passwordHash', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      name: 'Persona Demo', email: ' PERSONA@EXAMPLE.COM ', password: 'Clave123', passwordconf: 'Clave123',
    }).expect(201);
    expect(response.body.user.email).toBe('persona@example.com');
    expect(response.body.user.role).toBe('user');
    expect(response.body.user.passwordHash).toBeUndefined();
    userToken = response.body.token;
    ownId = response.body.user.id;
  });

  it('login rejects incorrect password and accepts correct password', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'persona@example.com', password: 'Incorrecta123' }).expect(400);
    const response = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'persona@example.com', password: 'Clave123' }).expect(200);
    expect(response.body.token).toEqual(expect.any(String));
    const admin = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin@example.com', password: 'Admin123' }).expect(200);
    adminToken = admin.body.token;
  });

  it('refresh requires a valid bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/refresh-token').expect(401);
    const response = await request(app.getHttpServer()).get('/api/v1/auth/refresh-token').set('Authorization', `Bearer ${userToken}`).expect(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('only admins can list and create users', async () => {
    await request(app.getHttpServer()).get('/api/v1/users').set('Authorization', `Bearer ${userToken}`).expect(403);
    await request(app.getHttpServer()).post('/api/v1/users').set('Authorization', `Bearer ${userToken}`).send({
      name: 'Nuevo Usuario', email: 'nuevo@example.com', password: 'Clave123', passwordconf: 'Clave123', role: 'admin',
    }).expect(403);
    const list = await request(app.getHttpServer()).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(list.body.length).toBe(2);
  });

  it('self access works by ID and email; someone else is rejected', async () => {
    await request(app.getHttpServer()).get(`/api/v1/users/${ownId}`).set('Authorization', `Bearer ${userToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/users/email/persona@example.com').set('Authorization', `Bearer ${userToken}`).expect(200);
    const adminId = [...db.rows.values()].find((row) => row.role === 'admin')!.id;
    await request(app.getHttpServer()).get(`/api/v1/users/${adminId}`).set('Authorization', `Bearer ${userToken}`).expect(401);
  });

  it('self update cannot grant admin, admin can update other accounts', async () => {
    const own = await request(app.getHttpServer()).patch(`/api/v1/users/${ownId}`).set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Nombre Nuevo', role: 'admin' }).expect(200);
    expect(own.body.role).toBe('user');
    const updated = await request(app.getHttpServer()).patch('/api/v1/users/email/persona@example.com').set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' }).expect(200);
    expect(updated.body.role).toBe('admin');
  });

  it('admin can create and delete accounts by email', async () => {
    const created = await request(app.getHttpServer()).post('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'Otra Cuenta', email: 'otra@example.com', password: 'Clave123', passwordconf: 'Clave123', role: 'user',
    }).expect(201);
    expect(created.body.role).toBe('user');
    await request(app.getHttpServer()).delete('/api/v1/users/email/otra@example.com').set('Authorization', `Bearer ${adminToken}`).expect(200, { message: 'User deleted' });
  });

  it('deleting account invalidates its token', async () => {
    await request(app.getHttpServer()).delete(`/api/v1/users/${ownId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/auth/refresh-token').set('Authorization', `Bearer ${userToken}`).expect(401);
  });
});
