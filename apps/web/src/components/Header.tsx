import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth-context";

const NAV_LINKS = [
  {
    href: "/clinicas",
    label: "Encontrar clínicas",
    match: (p: string) => p.startsWith("/clinicas") || p.startsWith("/clinica/"),
    authOnly: false
  },
  {
    href: "/sugerir",
    label: "Sugerir",
    match: (p: string) => p === "/sugerir" || p.startsWith("/sugerir/"),
    authOnly: false
  },
  {
    href: "/suporte",
    label: "Suporte",
    match: (p: string) => p === "/suporte" || p.startsWith("/suporte/"),
    authOnly: false
  },
  {
    href: "/favoritos",
    label: "Favoritos",
    match: (p: string) => p === "/favoritos" || p.startsWith("/favoritos/"),
    authOnly: true
  }
] as const;

function navLinkClass(active: boolean) {
  return `site-header-nav-link${active ? " site-header-nav-link--active" : ""}`;
}

export function Header() {
  const { token, profile, logout } = useAuth();
  const router = useRouter();
  const path = router.pathname;

  const displayName = profile?.name?.split(" ")[0] ?? "Conta";
  const accountActive = path === "/conta" || path.startsWith("/conta/");

  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-divider)",
        background: "var(--color-card)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 1px 0 rgba(15, 23, 42, 0.04)"
      }}
    >
      <div className="container site-header-inner">
        <Link href="/" className="site-header-brand">
          <span className="site-header-brand-name">OndeAchoTEA</span>
          <span className="site-header-brand-tag">TEA & TDAH — clínicas de confiança</span>
        </Link>

        <div className="site-header-actions">
          <nav className="site-header-nav" aria-label="Principal">
            {NAV_LINKS.filter((item) => !item.authOnly || Boolean(token)).map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.match(path))}>
                {item.label}
              </Link>
            ))}
          </nav>

          {token ? (
            <div className="site-header-user">
              <Link
                href="/conta"
                className={`site-header-account${accountActive ? " site-header-account--active" : ""}`}
                title="Minha conta"
              >
                <span>{displayName}</span>
              </Link>
              <button type="button" className="btn-header-signout" onClick={() => logout()}>
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-primary site-header-login"
              style={{ padding: "10px 18px", fontSize: 14 }}
              onClick={() => {
                void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
              }}
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
