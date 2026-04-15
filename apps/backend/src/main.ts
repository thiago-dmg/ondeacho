import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NextFunction, Request, Response } from "express";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const requestTimestampsByIp = new Map<string, number[]>();
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origem não permitida por CORS"), false);
    }
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const timestamps = (requestTimestampsByIp.get(ip) ?? []).filter(
      (timestamp) => now - timestamp <= rateLimitWindowMs
    );
    if (timestamps.length >= rateLimitMax) {
      res.status(429).json({ message: "Muitas requisições. Tente novamente em instantes." });
      return;
    }
    timestamps.push(now);
    requestTimestampsByIp.set(ip, timestamps);
    next();
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false
    })
  );

  const config = new DocumentBuilder()
    .setTitle("OndeAcho API")
    .setDescription("API para descoberta de profissionais e clínicas TEA/TDAH.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();
