import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ClinicCard } from "../src/components/ClinicCard";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";
import { useAuth } from "../src/lib/auth-context";
import { parseClinic } from "../src/lib/mappers";
import type { FavoriteRow } from "../src/lib/types";

export default function FavoritosPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!token) {
      void router.replace(`/login?from=${encodeURIComponent("/favoritos")}`);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await apiRequest<unknown[]>("/favorites");
        if (cancelled) {
          return;
        }
        const mapped: FavoriteRow[] = (raw as Record<string, unknown>[]).map((row) => {
          const clinicRaw = row.clinic as Record<string, unknown> | undefined;
          return {
            id: String(row.id ?? ""),
            clinicId: String(row.clinicId ?? ""),
            clinic: parseClinic(clinicRaw ?? {})
          };
        });
        setRows(mapped);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar favoritos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading, router]);

  if (authLoading || !token) {
    return (
      <SiteLayout title="Favoritos">
        <div className="container" style={{ padding: 40 }}>
          <p className="muted">Carregando…</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title="Favoritos" description="Clínicas que você salvou.">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 16px" }}>Favoritos</h1>
        {error ? (
          <p style={{ color: "#b45309" }}>{error}</p>
        ) : loading ? (
          <p className="muted">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="muted">
            Nenhuma clínica salva ainda.{" "}
            <Link href="/clinicas" style={{ fontWeight: 600 }}>
              Buscar clínicas
            </Link>
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20
            }}
          >
            {rows.map((r) => (
              <ClinicCard key={r.id} clinic={r.clinic} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
