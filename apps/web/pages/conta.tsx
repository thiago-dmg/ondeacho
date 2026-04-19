import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { useAuth } from "../src/lib/auth-context";

export default function ContaPage() {
  const { token, profile, loading, logout } = useAuth();
  const router = useRouter();

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

  return (
    <SiteLayout title="Minha conta">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48, maxWidth: 520 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Olá, {profile.name}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          {profile.email}
        </p>
        <div className="card" style={{ padding: 22 }}>
          <p style={{ margin: "0 0 12px" }}>
            <strong>Perfil:</strong> {profile.role}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Para alterar dados sensíveis no futuro, use o mesmo fluxo do aplicativo ou entre em contato com o suporte.
          </p>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
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
