import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "../src/components/AdminLayout";
import { setAdminToken } from "../src/lib/auth";
import { getSafeInternalPath } from "../src/lib/safe-redirect";
import { apiRequest } from "../src/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await apiRequest<{ accessToken: string; user: { role: string } }>(
        "/auth/login",
        {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim()
          })
        }
      );
      if (response.user.role !== "admin") {
        setMessage("Usuário sem permissão administrativa.");
        return;
      }
      setAdminToken(response.accessToken);
      const rawNext = router.query.next;
      const nextFromQuery = Array.isArray(rawNext) ? rawNext[0] : rawNext;
      const dest = getSafeInternalPath(nextFromQuery, "/dashboard");
      await router.push(dest);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de autenticação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout variant="auth" title="Entrar">
      <div className="oa-card" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="oa-brand__logo" style={{ fontSize: "1.35rem" }}>
            OndeAcho
          </div>
          <p className="oa-muted" style={{ margin: "8px 0 0" }}>
            Acesso restrito à equipe administrativa.
          </p>
        </div>
        <form onSubmit={(e) => void onSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="oa-field">
            <label className="oa-label" htmlFor="login-email">
              E-mail
            </label>
            <input
              id="login-email"
              className="oa-input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="oa-field">
            <label className="oa-label" htmlFor="login-pass">
              Senha
            </label>
            <input
              id="login-pass"
              className="oa-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="oa-btn oa-btn--primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        {message ? (
          <p className="oa-error" style={{ marginTop: 16 }}>
            {message}
          </p>
        ) : null}
      </div>
    </AdminLayout>
  );
}
