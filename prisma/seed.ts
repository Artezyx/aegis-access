import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const database = new PrismaClient();

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Configura SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD; no existe una contraseña predeterminada.');
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('La contraseña de administrador debe contener 8+ caracteres, mayúscula, minúscula y número.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await database.account.upsert({
    where: { email },
    update: { name: process.env.SEED_ADMIN_NAME || 'Administración', role: 'admin' },
    create: { name: process.env.SEED_ADMIN_NAME || 'Administración', email, passwordHash, role: 'admin' },
  });
  console.log('Administrador inicial disponible.');
}
seed().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => database.$disconnect());
