import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminLayout } from "../src/components/AdminLayout";
import { clearAdminToken } from "../src/lib/auth";
import { apiRequest } from "../src/services/api";

type Profile = { id: string; name: string; email: string; role: string };

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const me = await apiRequest<Profile>("/auth/me");
        setProfile(me);
        setName(me.name);
      } catch {
        setError("Sessão inválida.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const me = await apiRequest<Profile>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() })
      });
      setProfile(me);
      setMessage("Nome atualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiRequest("/auth/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Senha alterada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha.");
    }
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Encerrar sua conta permanentemente? Esta ação não pode ser desfeita.")) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiRequest("/auth/me/close-account", {
        method: "POST",
        body: JSON.stringify({ password: deletePassword })
      });
      clearAdminToken();
      await router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível encerrar a conta.");
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Meu perfil">
        <p className="oa-muted">Carregando…</p>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout title="Meu perfil">
        <p className="oa-error">{error || "Não autenticado."}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Meu perfil"
      description="Dados da sua conta administrativa. Para suporte geral ao projeto, use a página de suporte no site."
    >
      {message ? <p style={{ color: "var(--oa-teal-dark)", marginBottom: 12 }}>{message}</p> : null}
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-card" style={{ marginBottom: 20 }}>
        <h2 className="oa-card__title">Dados</h2>
        <p className="oa-muted" style={{ marginTop: 0 }}>
          {profile.email} · <span className="oa-badge oa-badge--muted">{profile.role}</span>
        </p>
        <form onSubmit={(e) => void saveName(e)} className="oa-form-grid" style={{ marginTop: 16 }}>
          <div className="oa-field" style={{ gridColumn: "1 / -1", maxWidth: 400 }}>
            <label className="oa-label" htmlFor="pf-name">
              Nome
            </label>
            <input id="pf-name" className="oa-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button type="submit" className="oa-btn oa-btn--primary">
            Salvar nome
          </button>
        </form>
      </div>

      <div className="oa-card" style={{ marginBottom: 20 }}>
        <h2 className="oa-card__title">Alterar senha</h2>
        <form onSubmit={(e) => void changePassword(e)} className="oa-form-grid oa-form-grid--2">
          <div className="oa-field">
            <label className="oa-label" htmlFor="pf-cp">
              Senha atual
            </label>
            <input
              id="pf-cp"
              className="oa-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="oa-field">
            <label className="oa-label" htmlFor="pf-np">
              Nova senha
            </label>
            <input
              id="pf-np"
              className="oa-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="oa-form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="oa-btn oa-btn--secondary">
              Atualizar senha
            </button>
          </div>
        </form>
      </div>

      <div className="oa-card" style={{ borderColor: "rgba(220, 38, 38, 0.35)", background: "var(--oa-danger-bg)" }}>
        <h2 className="oa-card__title" style={{ color: "#991b1b" }}>
          Encerrar conta
        </h2>
        <p className="oa-muted" style={{ marginBottom: 16 }}>
          Remove permanentemente o seu usuário. Se for o único admin, a operação será bloqueada.
        </p>
        <form onSubmit={(e) => void deleteAccount(e)} style={{ maxWidth: 360 }}>
          <div className="oa-field">
            <label className="oa-label" htmlFor="pf-del">
              Confirme com a senha atual
            </label>
            <input
              id="pf-del"
              className="oa-input"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="oa-btn oa-btn--danger" style={{ marginTop: 12 }}>
            Excluir minha conta
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard" className="oa-muted">
          ← Voltar ao painel
        </Link>
      </p>
    </AdminLayout>
  );
}
