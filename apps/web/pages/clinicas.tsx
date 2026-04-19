import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { ClinicCard } from "../src/components/ClinicCard";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";
import { parseClinic } from "../src/lib/mappers";
import type { CatalogOption, ClinicListing } from "../src/lib/types";

export default function ClinicasPage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<CatalogOption[]>([]);
  const [insurances, setInsurances] = useState<CatalogOption[]>([]);
  const [clinics, setClinics] = useState<ClinicListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specialtyId =
    router.isReady && typeof router.query.specialtyId === "string" ? router.query.specialtyId : "";
  const insuranceId =
    router.isReady && typeof router.query.insuranceId === "string" ? router.query.insuranceId : "";
  const city = router.isReady && typeof router.query.city === "string" ? router.query.city : "";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [s, i] = await Promise.all([
          apiRequest<unknown[]>("/catalog/specialties", { skipAuth: true }),
          apiRequest<unknown[]>("/catalog/insurances", { skipAuth: true })
        ]);
        if (cancelled) return;
        setSpecialties(
          (s as Record<string, unknown>[]).map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? "")
          }))
        );
        setInsurances(
          (i as Record<string, unknown>[]).map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? "")
          }))
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar catálogos.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadClinics = useCallback(async () => {
    if (!specialtyId && !insuranceId) {
      setClinics([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (specialtyId) {
        params.set("specialtyId", specialtyId);
      }
      if (insuranceId) {
        params.set("insuranceId", insuranceId);
      }
      if (city.trim()) {
        params.set("city", city.trim());
      }
      const qs = params.toString();
      const path = `/listings${qs ? `?${qs}` : ""}`;
      const raw = await apiRequest<unknown[]>(path, { skipAuth: true });
      setClinics(
        raw
          .filter((row): row is Record<string, unknown> => row !== null && typeof row === "object")
          .map(parseClinic)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar clínicas.");
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, [specialtyId, insuranceId, city]);

  useEffect(() => {
    void loadClinics();
  }, [loadClinics]);

  const updateQuery = (next: { specialtyId?: string; insuranceId?: string; city?: string }) => {
    void router.push(
      {
        pathname: "/clinicas",
        query: {
          specialtyId: next.specialtyId ?? specialtyId,
          insuranceId: next.insuranceId ?? insuranceId,
          city: next.city !== undefined ? next.city : city
        }
      },
      undefined,
      { shallow: true }
    );
  };

  const hasFilter = Boolean(specialtyId || insuranceId);

  if (!router.isReady) {
    return (
      <SiteLayout title="Encontrar clínicas">
        <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
          <p className="muted">Carregando…</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title="Encontrar clínicas" description="Filtre por especialidade, convênio e cidade.">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>Clínicas</h1>
        <p className="muted" style={{ margin: "0 0 24px", maxWidth: 640 }}>
          Selecione pelo menos uma especialidade ou um convênio para listar resultados (mesma regra do aplicativo).
        </p>

        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16
            }}
          >
            <label>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Especialidade
              </span>
              <select
                className="text-input"
                value={specialtyId}
                onChange={(e) => updateQuery({ specialtyId: e.target.value })}
              >
                <option value="">Selecione…</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Convênio
              </span>
              <select
                className="text-input"
                value={insuranceId}
                onChange={(e) => updateQuery({ insuranceId: e.target.value })}
              >
                <option value="">Selecione…</option>
                {insurances.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Cidade (opcional)
              </span>
              <input
                className="input"
                value={city}
                onChange={(e) => updateQuery({ city: e.target.value })}
                placeholder="Ex.: São Paulo"
              />
            </label>
          </div>
        </div>

        {error ? (
          <p style={{ color: "#b45309", marginBottom: 16 }} role="alert">
            {error}
          </p>
        ) : null}

        {!hasFilter ? (
          <p className="muted">Escolha especialidade ou convênio para começar.</p>
        ) : loading ? (
          <p className="muted">Carregando…</p>
        ) : clinics.length === 0 ? (
          <p className="muted">Nenhuma clínica encontrada com esses filtros.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20
            }}
          >
            {clinics.map((c) => (
              <ClinicCard key={c.id} clinic={c} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
