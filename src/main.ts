import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

import { AppLogger } from './common/logger/logger.service';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('🚀 [1/4] Criando App NestJS (HTTP + WebSocket padrão Nest)...');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: true,
  });

  // Logger
  try {
    const appLogger = app.get(AppLogger, { strict: false });
    if (appLogger) {
      app.useLogger(appLogger);
    } else {
      console.warn('⚠️ AppLogger não encontrado, usando logger padrão do Nest');
    }
  } catch {
    console.warn(
      '⚠️ Falha ao resolver AppLogger, usando logger padrão do Nest',
    );
  }

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(cookieParser());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Sabor de Rondônia API')
    .setDescription('API Project')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Inicializa o Nest (Roda onModuleInit, conecta banco, etc)
  console.log('🚀 [2/4] Inicializando Contexto do NestJS...');
  try {
    await app.init();
    console.log('✅ [2.1/4] app.init() concluiu sem erro');
  } catch (err) {
    console.error('❌ [FATAL] Erro durante app.init():', err);
    throw err;
  }

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');
  console.log(
    `✅ [3/4] Servidor ouvindo em http://localhost:${port} (HTTP + WebSocket)`,
  );
  console.log(`🔗 [4/4] Swagger em http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('❌ [FATAL] Erro no Bootstrap (catch externo):', err);
});
