import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { useAuth } from "../src/lib/auth-context";

export default function ContaPage() {
  const { token, profile, loading, logout, changePassword, closeAccount } = useAuth();
  const router = useRouter();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [delPw, setDelPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      void router.replace("/login?from=%2Fconta");
    }
  }, [loading, token, router]);

  if (loading || !token || !profile) {
    return (
      <SiteLayout title="Minha conta">
        <div className="container" style={{ padding: 40 }}>
          <p className="muted">Carregando…</p>
        </div>
      </SiteLayout>
    );
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newPw.length < 8) {
      setErr("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setMsg("Senha atualizada.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteAccount(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Excluir a conta permanentemente? Esta ação não pode ser desfeita.")) {
      return;
    }
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      await closeAccount(delPw);
      void router.replace("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não foi possível excluir a conta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout title="Minha conta">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48, maxWidth: 520 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Olá, {profile.name}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          {profile.email}
        </p>

        {msg ? (
          <p style={{ color: "#0f766e", marginBottom: 16 }} role="status">
            {msg}
          </p>
        ) : null}
        {err ? (
          <p style={{ color: "#b45309", marginBottom: 16 }} role="alert">
            {err}
          </p>
        ) : null}

        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Perfil:</strong> {profile.role}
          </p>
          <p className="muted" style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.5 }}>
            Aqui podes <strong>alterar a senha</strong> ou <strong>encerrar a conta</strong>. Precisa de ajuda?{" "}
            <Link href="/suporte" style={{ fontWeight: 600 }}>
              Suporte
            </Link>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#alterar-senha" className="btn-ghost" style={{ textDecoration: "none", padding: "10px 16px" }}>
              Ir para alterar senha
            </a>
            <a
              href="#excluir-conta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #dc2626",
                color: "#b91c1c",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none"
              }}
            >
              Ir para excluir conta
            </a>
          </div>
        </div>

        <div id="alterar-senha" className="card" style={{ padding: 22, marginBottom: 20, scrollMarginTop: 88 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>Alterar senha</h2>
          <form onSubmit={onChangePassword}>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Senha atual
              </span>
              <input
                className="input"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Nova senha (mín. 8)
              </span>
              <input
                className="input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={busy}>
              Atualizar senha
            </button>
          </form>
        </div>

        <div
          id="excluir-conta"
          className="card"
          style={{
            padding: 22,
            marginBottom: 24,
            borderColor: "rgba(220, 38, 38, 0.45)",
            background: "#fef2f2",
            scrollMarginTop: 88
          }}
        >
          <h2 style={{ fontSize: 17, margin: "0 0 8px", color: "#991b1b" }}>Excluir conta</h2>
          <p className="muted" style={{ margin: "0 0 14px", fontSize: 14 }}>
            Remove o utilizador e dados associados conforme as regras da plataforma.
          </p>
          <form onSubmit={onDeleteAccount}>
            <label style={{ display: "block", marginBottom: 14 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Confirme com a senha atual
              </span>
              <input
                className="input"
                type="password"
                value={delPw}
                onChange={(e) => setDelPw(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-ghost" style={{ borderColor: "#dc2626", color: "#b91c1c" }} disabled={busy}>
              Excluir minha conta
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/favoritos" className="btn-primary" style={{ textDecoration: "none" }}>
            Meus favoritos
          </Link>
          <button type="button" className="btn-ghost" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
