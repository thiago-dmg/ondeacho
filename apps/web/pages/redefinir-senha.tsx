import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = router.query.token;
    if (typeof t === "string") setToken(t);
  }, [router.query.token]);

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
      setError("Abra o link completo enviado por e-mail.");
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
      setError(err instanceof Error ? err.message : "Link inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout title="Nova senha">
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
          {ok ? (
            <>
              <h1 style={{ fontSize: 26, margin: "0 0 12px", color: "#0f766e" }}>Senha atualizada</h1>
              <p className="muted" style={{ lineHeight: 1.65, marginBottom: 16 }}>
                A sua conta já está com a nova senha. <strong>Volte ao aplicativo OndeAcho</strong> no celular e faça login
                normalmente — ou use o site abaixo.
              </p>
              <Link href="/login" className="btn-primary" style={{ display: "inline-block", marginTop: 8, textDecoration: "none" }}>
                Entrar na web
              </Link>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, margin: "0 0 10px" }}>Definir nova senha</h1>
              <p className="muted" style={{ marginBottom: 22, lineHeight: 1.55 }}>
                Escolha uma senha com pelo menos 8 caracteres.
              </p>
              <form onSubmit={onSubmit}>
                <label style={{ display: "block", marginBottom: 14 }}>
                  <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                    Nova senha
                  </span>
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                <label style={{ display: "block", marginBottom: 18 }}>
                  <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                    Repetir senha
                  </span>
                  <input
                    className="input"
                    type="password"
                    autoComplete="new-password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                {error ? (
                  <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
                    {error}
                  </p>
                ) : null}
                <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
                  {loading ? "A guardar…" : "Guardar nova senha"}
                </button>
              </form>
              <p style={{ marginTop: 20 }}>
                <Link href="/login">← Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
