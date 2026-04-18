import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";

/**
 * Registra no stdout (journalctl no systemd) qualquer 5xx com stack trace.
 * A resposta ao cliente permanece genérica em erros não-HTTP para não vazar detalhes.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.originalUrl ?? request.url;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const body =
        typeof res === "string"
          ? { statusCode: status, message: res }
          : (res as Record<string, unknown>);

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logServerError(request.method, path, status, exception);
      }

      response.status(status).json(body);
      return;
    }

    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logServerError(request.method, path, HttpStatus.INTERNAL_SERVER_ERROR, err);
    if (exception instanceof QueryFailedError) {
      this.logger.error(`[QueryFailedError] driverError: ${JSON.stringify(exception.driverError)}`);
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error"
    });
  }

  private logServerError(method: string, path: string, status: number, err: Error) {
    this.logger.error(`${method} ${path} → ${status} — ${err.message}`);
    if (err.stack) {
      this.logger.error(err.stack);
    }
  }
}
