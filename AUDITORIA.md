# Auditoría técnica inicial de Aegis Access

## Fuente de requisitos

ZIP adjunto `NestJS-Auth-REST-API-PostgreSQL-Prisma-Template-main(1).zip` analizado para identificar rutas y operaciones. La implementación presente es nueva.

## Paridad de rutas

- `GET /api/v1`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/refresh-token`
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `GET /api/v1/users/email/:email`
- `PATCH /api/v1/users/:id`
- `PATCH /api/v1/users/email/:email`
- `DELETE /api/v1/users/:id`
- `DELETE /api/v1/users/email/:email`

Las 12 rutas están implementadas en el código fuente (incluida la ruta de estado). Hay **11 operaciones de usuario/autenticación más el estado**. Esta coincidencia es estructural, no una certificación de comportamiento 1:1.

## Diferencias deliberadas

- Modelo interno `Account`/`passwordHash` en lugar de `User`/`password`.
- No hay cuentas de demostración con contraseña pública predefinida: el administrador inicial requiere credenciales explícitas.
- Se normaliza el correo en registro, login, búsquedas y actualizaciones.
- Se impide cambiar el rol mediante edición de cuenta propia.
- Reglas de contraseña y roles se extraen a un módulo independiente con pruebas nativas de Node.
- En registro y listados se devuelve además `updatedAt` si está disponible; no se devuelve contraseña.
- No se ha importado la colección Postman externa ni se han replicado sus ~160 casos.

## Estado real de validación

- Código fuente independiente: generado.
- Pruebas de reglas de negocio (14): **aprobadas**.
- Validación estática del contrato de rutas (14): **aprobada**.
- Revisión sintáctica de archivos TypeScript con el compilador de TypeScript (sin dependencias): **aprobada**.
- Compilación completa de NestJS: **pendiente** (registro npm inaccesible en el entorno de construcción).
- Pruebas Jest de servicios: **pendientes** (dependencias no instaladas).
- Integración con PostgreSQL/Prisma: **pendiente** (servidor y migraciones no ejecutados).
- Compatibilidad exacta de todas las respuestas/errores del proyecto de referencia: **pendiente de prueba comparativa**.

No utilices "probado al 100 %" en una presentación hasta superar todos los controles anteriores.
