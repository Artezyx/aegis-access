import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function start() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aegis Access')
    .setDescription('API de identidad, sesión JWT y administración de cuentas')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));
  await app.listen(Number(process.env.PORT || 3000));
}
start().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
