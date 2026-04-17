import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { ADMIN_PROTECTED_PATHS, ADMIN_PUBLIC_PATHS } from "../lib/admin-routes";
import { getAdminToken, syncAuthCookieFromStorage } from "../lib/auth";
import { getSafeInternalPath } from "../lib/safe-redirect";

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    syncAuthCookieFromStorage();

    const path = router.pathname;
    const token = getAdminToken();
    const rawNext = router.query.next;
    const nextFromQuery = Array.isArray(rawNext) ? rawNext[0] : rawNext;
    const nextParam = getSafeInternalPath(nextFromQuery, "/dashboard");

    if (ADMIN_PUBLIC_PATHS.has(path)) {
      if (path === "/login" && token) {
        void router.replace(nextParam);
        return;
      }
      setReady(true);
      return;
    }

    if (!ADMIN_PROTECTED_PATHS.has(path)) {
      setReady(true);
      return;
    }

    if (!token) {
      const login = `/login?next=${encodeURIComponent(path)}`;
      void router.replace(login);
      return;
    }

    setReady(true);
  }, [router.isReady, router.pathname, router.query.next]);

  if (!router.isReady || !ready) {
    return (
      <div className="oa-auth-wrap">
        <div className="oa-card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--oa-muted)" }}>Carregando…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
