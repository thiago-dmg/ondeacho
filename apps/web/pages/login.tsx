import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { useAuth } from "../src/lib/auth-context";

export default function LoginPage() {
  const { login, register, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = typeof router.query.from === "string" ? router.query.from : "/conta";

  useEffect(() => {
    if (!authLoading && token) {
      void router.replace(from.startsWith("/") ? from : "/conta");
    }
  }, [authLoading, token, router, from]);

  if (authLoading) {
    return (
      <SiteLayout title="Entrar">
        <div className="container" style={{ padding: 40 }}>
          <p className="muted">Carregando…</p>
        </div>
      </SiteLayout>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (name.trim().length < 2) {
          throw new Error("Informe seu nome.");
        }
        await register(name, email, password);
      }
      void router.replace(from.startsWith("/") ? from : "/conta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout title={mode === "login" ? "Entrar" : "Criar conta"}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 48, maxWidth: 440 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Use a mesma conta do aplicativo OndeAcho (API compartilhada).
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className={mode === "login" ? "btn-primary" : "btn-ghost"}
            style={{ flex: 1 }}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === "register" ? "btn-primary" : "btn-ghost"}
            style={{ flex: 1 }}
            onClick={() => setMode("register")}
          >
            Cadastrar
          </button>
        </div>

        <form className="card" style={{ padding: 24 }} onSubmit={onSubmit}>
          {mode === "register" ? (
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Nome
              </span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required={mode === "register"}
              />
            </label>
          ) : null}
          <label style={{ display: "block", marginBottom: 16 }}>
            <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
              E-mail
            </span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
              Senha
            </span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </label>
          {error ? (
            <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <p style={{ marginTop: 20 }} className="muted">
          <Link href="/">Voltar ao início</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
