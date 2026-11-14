# Aegis Access

Servicio de identidad y cuentas desarrollado desde cero con **NestJS, Prisma y PostgreSQL**. Proyecto académico de práctica y evaluación de APIs. Se utilizó como *referencia de comportamiento*, no como código base, el repositorio público `JulianCallejas/NestJS-Auth-REST-API-PostgreSQL-Prisma-Template`.

## Funcionalidades

- Registro público con rol `user`, correo normalizado y contraseñas protegidas con bcrypt.
- Inicio de sesión JWT y renovación de token con cuenta autenticada.
- Roles `admin` y `user`; permisos de administrador para crear o listar usuarios.
- Acceso, modificación y borrado por **ID** o **correo**: cada usuario puede gestionar su propia cuenta y el administrador cualquier cuenta.
- Los usuarios normales no pueden cambiar su rol; nunca se devuelve un hash de contraseña.
- Documentación Swagger en `/api`; status en `/api/v1`.
- Validación estricta de los cuerpos de petición. Errores explícitos para datos repetidos y usuarios inexistentes.

## Puesta en marcha (Node 20+ y Docker)

```bash
cp .env.example .env
# Cambia POSTGRES_PASSWORD y JWT_SECRET en .env
npm install
npx prisma generate
docker compose up -d
npx prisma migrate dev --name initial
# Si quieres un administrador inicial, configura SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
npm run db:seed
npm run start:dev
```

En Windows PowerShell, usa `Copy-Item .env.example .env`.

**Atención:** no publiques `.env`; `.env.example` solo incluye valores de ejemplo. Las contraseñas iniciales no se establecen de forma automática. La ruta `db:seed` exige credenciales configuradas expresamente.

## Contrato de API

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/v1` | Público |
| POST | `/api/v1/auth/register` | Público |
| POST | `/api/v1/auth/login` | Público |
| GET | `/api/v1/auth/refresh-token` | Autenticado |
| POST | `/api/v1/users` | Admin |
| GET | `/api/v1/users` | Admin |
| GET | `/api/v1/users/:id` | Propietario o admin |
| GET | `/api/v1/users/email/:email` | Propietario o admin |
| PATCH | `/api/v1/users/:id` | Propietario o admin |
| PATCH | `/api/v1/users/email/:email` | Propietario o admin |
| DELETE | `/api/v1/users/:id` | Propietario o admin |
| DELETE | `/api/v1/users/email/:email` | Propietario o admin |

### Ejemplo: registro

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Pérez","email":"ana@example.com","password":"Prueba123","passwordconf":"Prueba123"}'
```

Para usar los endpoints privados, envía `Authorization: Bearer <JWT>`.

## Pruebas

```bash
npm run test:offline  # reglas de negocio y contrato estático sin infraestructura
npm test             # pruebas unitarias de servicios (requieren npm install)
npm run build        # compilación TypeScript de NestJS (requiere npm install)
```

### Estado de verificación de esta entrega

Las pruebas sobre `identity-policy.js` pueden ejecutarse sin instalar paquetes. **Las pruebas Jest, el build de NestJS y las pruebas reales con PostgreSQL requieren instalar las dependencias y tener una base de datos accesible.** No se declaran aprobadas hasta ejecutarlas. Ver `AUDITORIA.md`.

## Autoría y uso académico

Esta es una implementación independiente preparada para estudio con asistencia de IA. El comportamiento externo se comparó con el proyecto mencionado como referencia; no se copiaron sus archivos de código ni sus licencias a esta entrega. Documenta los cambios y las pruebas que tú mismo realices antes de presentarlo como tu trabajo.
