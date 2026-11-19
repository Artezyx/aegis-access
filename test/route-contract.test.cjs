const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const auth = fs.readFileSync(path.join(__dirname, '../src/auth/auth.controller.ts'), 'utf8');
const accounts = fs.readFileSync(path.join(__dirname, '../src/accounts/accounts.controller.ts'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../src/app.module.ts'), 'utf8');
const routes = [
  [app, /@Get\(\)/, 'GET status'],
  [auth, /@Post\('register'\)/, 'POST register'],
  [auth, /@Post\('login'\)/, 'POST login'],
  [auth, /@Get\('refresh-token'\)/, 'GET refresh'],
  [accounts, /@Post\(\)/, 'POST users'],
  [accounts, /@Get\(\)/, 'GET users'],
  [accounts, /@Get\('email\/:email'\)/, 'GET email'],
  [accounts, /@Get\(':id'\)/, 'GET id'],
  [accounts, /@Patch\('email\/:email'\)/, 'PATCH email'],
  [accounts, /@Patch\(':id'\)/, 'PATCH id'],
  [accounts, /@Delete\('email\/:email'\)/, 'DELETE email'],
  [accounts, /@Delete\(':id'\)/, 'DELETE id'],
];
for (const [source, pattern, title] of routes) {
  test('declaración de ruta: ' + title, () => assert.match(source, pattern));
}
test('prefijo original declarado', () => assert.match(fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf8'), /setGlobalPrefix\('api\/v1'\)/));
test('Swagger API documentada', () => assert.match(fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf8'), /SwaggerModule\.setup\('api'/));
