import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminLayout } from "../src/components/AdminLayout";
import { apiRequest } from "../src/services/api";

const publicWebOrigin = (process.env.NEXT_PUBLIC_PUBLIC_WEB_ORIGIN ?? "").trim().replace(/\/+$/, "");

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectingToWeb, setRedirectingToWeb] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (!publicWebOrigin) {
      const t = router.query.token;
      if (typeof t === "string") {
        setToken(t);
      }
      return;
    }
    const t = router.query.token;
    if (typeof t === "string" && t.trim().length > 0) {
      setRedirectingToWeb(true);
      window.location.replace(
        `${publicWebOrigin}/redefinir-senha?token=${encodeURIComponent(t.trim())}`
      );
      return;
    }
    if (typeof t === "string") {
      setToken(t);
    }
  }, [router.isReady, router.query.token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) {
      setError("Link inválido. Abra o link completo enviado por e-mail.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        skipAuth: true
      });
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir.");
    } finally {
      setLoading(false);
    }
  }

  if (!router.isReady || redirectingToWeb) {
    return (
      <AdminLayout variant="auth" title="Nova senha">
        <div className="oa-card" style={{ maxWidth: 440, padding: 28, textAlign: "center" }}>
          <p className="oa-muted" style={{ margin: 0 }}>
            {redirectingToWeb
              ? "Abrindo o site público para definir a nova senha…"
              : "Carregando…"}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout variant="auth" title="Nova senha">
      <div
        className="oa-card"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "linear-gradient(180deg, #fff 0%, #f8fafc 100%)",
          border: "1px solid var(--oa-border)",
          boxShadow: "0 12px 40px rgba(13, 148, 136, 0.12)"
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #0d9488, #5eead4)",
            marginBottom: 16
          }}
        />
        {ok ? (
          <>
            <h1 style={{ fontSize: "1.35rem", margin: "0 0 12px", color: "var(--oa-teal-dark)" }}>Senha atualizada</h1>
            <p className="oa-muted" style={{ lineHeight: 1.55 }}>
              Já pode entrar com a nova senha.
            </p>
            <p style={{ marginTop: 24 }}>
              <Link href="/login">Ir para o login</Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.35rem", margin: "0 0 8px" }}>Definir nova senha</h1>
            <p className="oa-muted" style={{ margin: "0 0 20px", lineHeight: 1.5 }}>
              Escolha uma senha forte (mínimo 8 caracteres).
            </p>
            <form onSubmit={(e) => void onSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="oa-field">
                <label className="oa-label" htmlFor="np1">
                  Nova senha
                </label>
                <input
                  id="np1"
                  className="oa-input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="oa-field">
                <label className="oa-label" htmlFor="np2">
                  Repetir senha
                </label>
                <input
                  id="np2"
                  className="oa-input"
                  type="password"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {error ? <p className="oa-error">{error}</p> : null}
              <button type="submit" className="oa-btn oa-btn--primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
            <p style={{ marginTop: 20 }}>
              <Link href="/login">← Login</Link>
            </p>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
