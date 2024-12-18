import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@app/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Security
    app.use(helmet() as any);
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
      })
    );

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    // Global filters
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger
    const swaggerConfig = configService.get('swagger');
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // RabbitMQ Connection
    const rabbitmqConfig = configService.get('rabbitmq');
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqConfig.url],
        queue: rabbitmqConfig.queue,
        queueOptions: rabbitmqConfig.queueOptions,
        noAck: false,
      },
    });

    await app.startAllMicroservices();
    const port = configService.get('port');
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log('Microservice is listening');
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap();
