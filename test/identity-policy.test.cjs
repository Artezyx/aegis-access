'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const p = require('../src/domain/identity-policy.js');
const user = { id: 'uuid-1', email: 'Persona@Ejemplo.COM', role: 'user' };
const admin = { id: 'admin-1', email: 'admin@ejemplo.com', role: 'admin' };

test('normaliza el correo y elimina espacios', () => assert.equal(p.normalizeEmail('  Test@Ejemplo.COM '), 'test@ejemplo.com'));
test('una cuenta puede acceder a su UUID', () => assert.equal(p.isOwnerOrAdmin(user, 'id', 'uuid-1'), true));
test('una cuenta no accede al UUID de otros', () => assert.equal(p.isOwnerOrAdmin(user, 'id', 'uuid-2'), false));
test('una cuenta puede acceder a su correo sin importar mayúsculas', () => assert.equal(p.isOwnerOrAdmin(user, 'email', ' persona@ejemplo.com '), true));
test('una cuenta no accede al correo ajeno', () => assert.equal(p.isOwnerOrAdmin(user, 'email', 'otro@ejemplo.com'), false));
test('administrador puede operar cualquier cuenta', () => assert.equal(p.isOwnerOrAdmin(admin, 'id', 'uuid-2'), true));
test('usuario anónimo no opera sobre cuentas', () => assert.equal(p.isOwnerOrAdmin(null, 'id', 'uuid-1'), false));
test('no administrador no puede cambiar roles', () => assert.deepEqual(p.safeChanges({ name: 'Ana', role: 'admin' }, 'user'), { name: 'Ana' }));
test('admin sí puede cambiar roles', () => assert.deepEqual(p.safeChanges({ role: 'user' }, 'admin'), { role: 'user' }));
test('información pública no expone contraseñas', () => {
  const result = p.redactAccount({ id: '1', name: 'Ana', email: 'ana@e.com', role: 'user', passwordHash: 'never-return', createdAt: new Date() });
  assert.equal('passwordHash' in result, false);
});
test('contraseña válida según reglas del proyecto original', () => assert.deepEqual(p.passwordPolicyErrors('Prueba123'), []));
test('contraseña sin números falla', () => assert.ok(p.passwordPolicyErrors('PruebaABC').length > 0));
test('contraseña con espacios falla', () => assert.ok(p.passwordPolicyErrors('Prueba 123').length > 0));
test('contraseña demasiado larga falla', () => assert.ok(p.passwordPolicyErrors('Prueba123123123123123').length > 0));
