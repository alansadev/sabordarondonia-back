import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { json } from 'express';

const PORT = parseInt(process.env.PORT as string, 10);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sabor de Rondônia API')
    .setDescription('Documentação da API para o projeto Sabor de Rondônia.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `Por favor, insira o token no seguinte formato: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  app.use(json({ limit: '10mb' }));
  // app.enableCors({
  //   // origin: 'http://192.168.1.14:5173', // A URL do seu front-end
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: false,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(PORT);
}
bootstrap().catch((err) => {
  console.error('NestJS application failed to start:', err);
});
