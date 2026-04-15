import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  liveness() {
    return { status: "ok", service: "ondeacho-backend", timestamp: new Date().toISOString() };
  }

  @Get("ready")
  readiness() {
    return this.healthService.readiness();
  }
}
