import { FormEvent, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "../src/components/AdminLayout";
import { apiRequest } from "../src/services/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        skipAuth: true
      });
      setMessage("Se existir uma conta com este e-mail, enviámos instruções para redefinir a senha.");
    } catch {
      setMessage("Se existir uma conta com este e-mail, enviámos instruções para redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout variant="auth" title="Esqueci a senha">
      <div className="oa-card" style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>Esqueci a senha</h1>
        <p className="oa-muted" style={{ margin: "0 0 20px", lineHeight: 1.5 }}>
          Informe o e-mail da sua conta. O link de redefinição é o mesmo do site público (configurado no servidor).
        </p>
        <form onSubmit={(e) => void onSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="oa-field">
            <label className="oa-label" htmlFor="fp-email">
              E-mail
            </label>
            <input
              id="fp-email"
              className="oa-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="oa-btn oa-btn--primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </button>
        </form>
        {message ? (
          <p style={{ marginTop: 16, color: "var(--oa-teal-dark)", fontSize: "0.9rem", lineHeight: 1.5 }}>{message}</p>
        ) : null}
        <p style={{ marginTop: 20 }}>
          <Link href="/login">← Voltar ao login</Link>
        </p>
      </div>
    </AdminLayout>
  );
}
