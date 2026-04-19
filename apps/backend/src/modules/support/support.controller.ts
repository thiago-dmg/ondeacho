import { Body, Controller, Post, ServiceUnavailableException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MailService } from "../mail/mail.service";
import { SupportMessageDto } from "./dto/support-message.dto";

@ApiTags("support")
@Controller("support")
export class SupportController {
  constructor(private readonly mailService: MailService) {}

  @Post("message")
  async sendMessage(@Body() dto: SupportMessageDto) {
    try {
      await this.mailService.sendSupportTicket({
        fromEmail: dto.email.toLowerCase().trim(),
        name: dto.name,
        message: dto.message.trim()
      });
    } catch {
      throw new ServiceUnavailableException(
        "Envio de e-mail indisponível. Verifique SENDGRID_API_KEY no servidor ou tente mais tarde."
      );
    }
    return { ok: true };
  }
}
