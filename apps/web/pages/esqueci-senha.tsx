import { FormEvent, useState } from "react";
import Link from "next/link";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        skipAuth: true
      });
    } catch {
      /* mesma mensagem */
    } finally {
      setLoading(false);
      setMsg(
        "Se existir uma conta com este e-mail, enviámos um link para redefinir a senha. Abra o e-mail, defina a nova senha na página que abrir e depois volte ao aplicativo ou à web para entrar."
      );
    }
  }

  return (
    <SiteLayout title="Esqueci a senha">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 48, maxWidth: 460 }}>
        <div
          className="card"
          style={{
            padding: 28,
            background: "linear-gradient(180deg, #fff 0%, #f8fafc 100%)",
            border: "1px solid var(--color-divider)",
            boxShadow: "0 16px 48px rgba(13, 148, 136, 0.1)"
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #0d9488, #5eead4)",
              marginBottom: 18
            }}
          />
          <h1 style={{ fontSize: 26, margin: "0 0 10px" }}>Esqueci a senha</h1>
          <p className="muted" style={{ marginBottom: 22, lineHeight: 1.55 }}>
            Indique o e-mail da sua conta. Enviaremos um link seguro (válido por 1 hora).
          </p>
          <form onSubmit={onSubmit}>
            <label style={{ display: "block", marginBottom: 18 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                E-mail
              </span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "A enviar…" : "Enviar link"}
            </button>
          </form>
          {msg ? (
            <p style={{ marginTop: 18, color: "#0f766e", fontSize: 15, lineHeight: 1.5 }}>{msg}</p>
          ) : null}
          <p style={{ marginTop: 22 }}>
            <Link href="/login">← Voltar ao login</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
