import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { SupportController } from "./support.controller";

@Module({
  imports: [MailModule],
  controllers: [SupportController]
})
export class SupportModule {}
