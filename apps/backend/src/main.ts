import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NextFunction, Request, Response } from "express";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AppModule } from "./modules/app.module";

/** Origens do site + admin em produção (unidas com CORS_ORIGINS no .env). */
const PRODUCTION_BROWSER_ORIGINS = [
  "https://ondeachotea.com",
  "https://www.ondeachotea.com",
  "https://admin.ondeachotea.com",
  "http://ondeachotea.com",
  "http://www.ondeachotea.com",
  "http://admin.ondeachotea.com"
];

function buildAllowedCorsOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return [...new Set([...fromEnv, ...PRODUCTION_BROWSER_ORIGINS])];
  }

  if (fromEnv.length > 0) {
    return fromEnv;
  }

  return [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002"
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = buildAllowedCorsOrigins();
  const logger = new Logger("Bootstrap");
  logger.log(`CORS: ${allowedOrigins.length} origem(ns) — ${allowedOrigins.join(" | ")}`);

  const requestTimestampsByIp = new Map<string, number[]>();
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["Content-Length"],
    maxAge: 86400
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
  app.useGlobalFilters(new AllExceptionsFilter());
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
