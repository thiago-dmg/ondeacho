import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

function passwordResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f0f4f3;font-family:Segoe UI,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,118,110,0.12);">
        <tr><td style="background:linear-gradient(135deg,#0d9488 0%,#14b8a6 50%,#5eead4 100%);padding:28px 24px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;">OndeAcho</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:6px;">TEA & TDAH</div>
        </td></tr>
        <tr><td style="padding:32px 28px 24px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#134e4a;">Redefinir sua senha</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#475569;">
            Recebemos um pedido para criar uma nova senha. Se foi você, use o botão abaixo. O link expira em <strong>1 hora</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px;">
            Redefinir senha
          </a>
          <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">
            Se o botão não funcionar, copie e cole no navegador:<br/>
            <span style="color:#64748b;">${resetUrl}</span>
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
            Se você não pediu isso, ignore este e-mail — sua senha permanece a mesma.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  private get fromEmail(): string {
    return (this.config.get<string>("SENDGRID_FROM") ?? "suporte@ondeachotea.com").trim();
  }

  private get supportInbox(): string {
    return (this.config.get<string>("SUPPORT_INBOX_EMAIL") ?? this.fromEmail).trim();
  }

  private async sendGridOrThrow(payload: Record<string, unknown>): Promise<void> {
    const apiKey = this.config.get<string>("SENDGRID_API_KEY")?.trim();
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY não configurada.");
    }
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`SendGrid HTTP ${res.status}: ${text}`);
      throw new Error("Falha ao enviar e-mail.");
    }
  }

  async sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
    const apiKey = this.config.get<string>("SENDGRID_API_KEY")?.trim();
    if (!apiKey) {
      this.logger.warn(`SENDGRID ausente — link de reset (apenas log): ${resetUrl}`);
      return;
    }
    await this.sendGridOrThrow({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: this.fromEmail, name: "OndeAcho" },
      subject: "Redefinir sua senha — OndeAcho",
      content: [{ type: "text/html", value: passwordResetEmailHtml(resetUrl) }]
    });
  }

  async sendSupportTicket(params: { fromEmail: string; name?: string; message: string }): Promise<void> {
    const safeName = params.name ? escapeHtml(params.name.trim()) : "—";
    const safeMsg = escapeHtml(params.message.trim()).replace(/\n/g, "<br/>");
    const html = `<p><strong>Nome:</strong> ${safeName}</p><p><strong>E-mail de resposta:</strong> ${escapeHtml(
      params.fromEmail
    )}</p><hr/><p>${safeMsg}</p>`;
    await this.sendGridOrThrow({
      personalizations: [{ to: [{ email: this.supportInbox }] }],
      reply_to: { email: params.fromEmail.trim() },
      from: { email: this.fromEmail, name: "OndeAcho Suporte" },
      subject: `[OndeAcho] Mensagem de suporte — ${params.fromEmail}`,
      content: [{ type: "text/html", value: html }]
    });
  }
}
