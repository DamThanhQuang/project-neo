import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable the default body parser
  });

  // Apply custom body parser with larger limit
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8000;
  console.log(`Server is running on port ${port}`);

  app.use(cookieParser());

  app.setGlobalPrefix('/api/v1');

  // Cấu hình CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Chỉ cho phép frontend truy cập
    credentials: true, // Cho phép gửi cookie/token
    allowedHeaders: ['Content-Type', 'Authorization'], // Header được phép gửi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Các phương thức được phép
  });
  app.use((req, res, next) => {
    res.setTimeout(15000, () => {
      res.status(408).send('Request Timeout');
    });
    next();
  });
  await app.listen(port);
}
bootstrap();
