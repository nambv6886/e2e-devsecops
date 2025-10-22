import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SeederService } from './modules/seeder/seeder.service';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security middleware
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: false,
  //     crossOriginEmbedderPolicy: false,
  //   }),
  // );

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Location Based Service Search System')
    .setDescription('The location based service search system API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Run database seeder if enabled
  const runSeeder = process.env.RUN_SEEDER === 'true';
  if (runSeeder) {
    logger.log('Database seeding is enabled...');
    const seeder = app.get(SeederService);
    await seeder.seed();
  }

  const port = process.env.PORT ?? 3000;
  // Listen on 0.0.0.0 to accept connections from outside the container
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(
    `Swagger documentation is available at: http://0.0.0.0:${port}/api/docs`,
  );
}

bootstrap();
