import { FormEvent, useState } from "react";
import Link from "next/link";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";

export default function SuportePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errText, setErrText] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrText("");
    setSending(true);
    try {
      await apiRequest("/support/message", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          message: message.trim()
        }),
        skipAuth: true
      });
      setStatus("ok");
      setMessage("");
    } catch (err) {
      setStatus("err");
      setErrText(err instanceof Error ? err.message : "Não foi possível enviar.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteLayout title="Suporte" description="Fale com a equipa OndeAcho.">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 56, maxWidth: 560 }}>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>Suporte</h1>
        <p className="muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
          Dúvidas, problemas técnicos ou sugestões. A mensagem é enviada para a nossa equipa por e-mail. Resposta típica
          em dias úteis.
        </p>

        {status === "ok" ? (
          <div className="card" style={{ padding: 22, borderColor: "rgba(13, 148, 136, 0.35)", background: "#ecfdf5" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#065f46" }}>Mensagem enviada. Obrigado!</p>
            <p className="muted" style={{ margin: "10px 0 0", fontSize: 14 }}>
              Verifique a caixa de entrada (e spam) para futuras respostas.
            </p>
          </div>
        ) : (
          <form className="card" style={{ padding: 24 }} onSubmit={onSubmit}>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Nome (opcional)
              </span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                E-mail para resposta *
              </span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label style={{ display: "block", marginBottom: 18 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Mensagem * (mín. 10 caracteres)
              </span>
              <textarea
                className="input"
                style={{ minHeight: 140, resize: "vertical" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
              />
            </label>
            {status === "err" ? (
              <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
                {errText}
              </p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? "A enviar…" : "Enviar mensagem"}
            </button>
          </form>
        )}

        <p style={{ marginTop: 28 }} className="muted">
          <Link href="/">← Início</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
