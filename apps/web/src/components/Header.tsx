import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth-context";

export function Header() {
  const { token, profile, logout } = useAuth();
  const router = useRouter();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background: "var(--color-card)",
        position: "sticky",
        top: 0,
        zIndex: 40
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>OndeAcho</span>
          <span className="muted" style={{ display: "block", fontSize: 12, fontWeight: 500 }}>
            TEA & TDAH — clínicas de confiança
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/clinicas" style={{ fontWeight: 600, fontSize: 15 }}>
            Encontrar clínicas
          </Link>
          <Link href="/sugerir" style={{ fontWeight: 600, fontSize: 15 }}>
            Sugerir
          </Link>
          {token ? (
            <>
              <Link href="/favoritos" style={{ fontWeight: 600, fontSize: 15 }}>
                Favoritos
              </Link>
              <Link href="/conta" style={{ fontWeight: 600, fontSize: 15 }}>
                {profile?.name?.split(" ")[0] ?? "Conta"}
              </Link>
              <button type="button" className="btn-ghost" onClick={() => logout()}>
                Sair
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: "10px 16px" }}
              onClick={() => {
                void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
              }}
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
