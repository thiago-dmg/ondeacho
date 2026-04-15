import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async readiness() {
    try {
      await this.dataSource.query("SELECT 1");
      return {
        status: "ready",
        database: "ok",
        timestamp: new Date().toISOString()
      };
    } catch {
      throw new ServiceUnavailableException("Banco indisponível");
    }
  }
}
