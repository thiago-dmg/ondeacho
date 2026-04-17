import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { clearAdminToken } from "../lib/auth";

const NAV: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clinics", label: "Clínicas" },
  { href: "/professionals", label: "Profissionais" },
  { href: "/specialties", label: "Especialidades" },
  { href: "/insurances", label: "Convênios" },
  { href: "/reviews", label: "Avaliações" },
  { href: "/clinic-suggestions", label: "Sugestões" },
  { href: "/profile-claims", label: "Reivindicações" }
];

function NavIcon({ href }: { href: string }) {
  const p = { width: 20, height: 20, fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (href) {
    case "/dashboard":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
      );
    case "/clinics":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6" />
        </svg>
      );
    case "/professionals":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "/specialties":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M4.5 12.5c0-4 3.5-7 7.5-7s7.5 3 7.5 7-3.5 7-7.5 7a7 7 0 01-3-.7L4 20l1.3-4.8a7 7 0 01-.8-3z" />
        </svg>
      );
    case "/insurances":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" />
        </svg>
      );
    case "/reviews":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M12 3l2.6 5.3L20 9.3l-4 3.9.9 5.8L12 16.9 7.1 19l.9-5.8-4-3.9 5.4-.9L12 3z" />
        </svg>
      );
    case "/clinic-suggestions":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M9 18h6M10 21h4M12 3a7 7 0 017 7v3H5v-3a7 7 0 017-7z" />
        </svg>
      );
    case "/profile-claims":
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <path d="M9 12h6M9 16h6M7 4h10a2 2 0 012 2v14l-4-2-3 1-3-1-4 2V6a2 2 0 012-2z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" {...p}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

type Props = {
  children: ReactNode;
  title: string;
  description?: string;
  variant?: "app" | "auth" | "minimal";
};

export function AdminLayout({ children, title, description, variant = "app" }: Props) {
  const router = useRouter();

  if (variant === "auth") {
    return (
      <>
        <Head>
          <title>{title} · OndeAcho Admin</title>
        </Head>
        <div className="oa-auth-wrap">{children}</div>
      </>
    );
  }

  if (variant === "minimal") {
    return (
      <>
        <Head>
          <title>{title} · OndeAcho Admin</title>
        </Head>
        <div style={{ minHeight: "100vh", padding: 28, background: "var(--oa-bg)" }}>{children}</div>
      </>
    );
  }

  async function logout() {
    clearAdminToken();
    await router.push("/login");
  }

  return (
    <>
      <Head>
        <title>{title} · OndeAcho Admin</title>
      </Head>
      <div className="oa-shell">
        <aside className="oa-sidebar" aria-label="Navegação principal">
          <div className="oa-brand">
            <div className="oa-brand__logo">OndeAcho</div>
            <div className="oa-brand__sub">Painel administrativo</div>
          </div>
          <nav className="oa-nav">
            {NAV.map((item) => {
              const active =
                router.pathname === item.href ||
                (item.href !== "/dashboard" && router.pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} data-active={active}>
                  <span className="oa-nav__icon" aria-hidden>
                    <NavIcon href={item.href} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="oa-sidebar__footer">
            <button type="button" className="oa-btn oa-btn--ghost" style={{ width: "100%" }} onClick={() => void logout()}>
              Sair
            </button>
          </div>
        </aside>
        <div className="oa-main">
          <header className="oa-topbar">
            <div className="oa-topbar__titles">
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
          </header>
          <div className="oa-content">{children}</div>
        </div>
      </div>
    </>
  );
}
