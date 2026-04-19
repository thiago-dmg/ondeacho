import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteLayout } from "../../src/components/SiteLayout";
import { StarRating } from "../../src/components/StarRating";
import { apiRequest } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth-context";
import { parseClinic, parseReview } from "../../src/lib/mappers";
import type { ClinicListing, FavoriteRow, PublicReview, ReviewSummary } from "../../src/lib/types";

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function buildAddress(clinic: ClinicListing): string {
  const street = [clinic.addressLine, clinic.addressNumber].filter(Boolean).join(", ");
  const loc = [clinic.neighborhood, clinic.city].filter(Boolean).join(" — ");
  const primary = [street, loc].filter((s) => s.length > 0).join(" • ");
  if (!primary) {
    return clinic.city;
  }
  if (clinic.zipcode) {
    return `${primary} • CEP ${clinic.zipcode}`;
  }
  return primary;
}

export default function ClinicaDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const { token } = useAuth();

  const [clinic, setClinic] = useState<ClinicListing | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [contactMsg, setContactMsg] = useState<string | null>(null);

  const mapsUrl = useMemo(() => {
    if (!clinic) {
      return "";
    }
    const q = buildAddress(clinic);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [clinic]);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [raw, sum, revs] = await Promise.all([
        apiRequest<Record<string, unknown>>(`/listings/${id}`, { skipAuth: !token }),
        apiRequest<ReviewSummary>(`/reviews/listing/${id}/summary`, { skipAuth: true }),
        apiRequest<unknown[]>(`/reviews/listing/${id}`, { skipAuth: true })
      ]);
      setClinic(parseClinic(raw));
      setSummary(sum);
      setReviews(
        revs
          .filter((r): r is Record<string, unknown> => r !== null && typeof r === "object")
          .map(parseReview)
      );

      if (token) {
        const favs = await apiRequest<FavoriteRow[]>("/favorites");
        const hit = favs.find((f) => f.clinicId === id);
        setFavoriteId(hit ? hit.id : null);
      } else {
        setFavoriteId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
      setClinic(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleFavorite = async () => {
    if (!token || !clinic) {
      void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setContactMsg(null);
    try {
      if (favoriteId) {
        await apiRequest(`/favorites/${clinic.id}`, { method: "DELETE" });
        setFavoriteId(null);
      } else {
        const created = await apiRequest<{ id: string }>("/favorites", {
          method: "POST",
          body: JSON.stringify({ clinicId: clinic.id })
        });
        setFavoriteId(created.id);
      }
    } catch (e) {
      setContactMsg(e instanceof Error ? e.message : "Não foi possível atualizar favoritos.");
    }
  };

  const sendContact = async (channel: "whatsapp" | "phone" | "email") => {
    if (!token || !clinic) {
      void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setContactMsg(null);
    try {
      await apiRequest("/contacts", {
        method: "POST",
        body: JSON.stringify({ clinicId: clinic.id, preferredChannel: channel, message: "" })
      });
      setContactMsg("Interesse registrado com sucesso.");
    } catch (e) {
      setContactMsg(e instanceof Error ? e.message : "Erro ao registrar contato.");
    }
  };

  if (!router.isReady || loading) {
    return (
      <SiteLayout title="Clínica">
        <div className="container" style={{ padding: 40 }}>
          <p className="muted">Carregando…</p>
        </div>
      </SiteLayout>
    );
  }

  if (error || !clinic) {
    return (
      <SiteLayout title="Clínica">
        <div className="container" style={{ padding: 40 }}>
          <p role="alert">{error ?? "Clínica não encontrada."}</p>
          <Link href="/clinicas">Voltar</Link>
        </div>
      </SiteLayout>
    );
  }

  const phone = (clinic.phone ?? "").trim();
  const wa = (clinic.whatsappPhone ?? "").trim();
  const waDigits = digitsOnly(wa);
  const phoneDigits = digitsOnly(phone);

  return (
    <SiteLayout title={clinic.name} description={clinic.description ?? undefined}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <Link href="/clinicas" className="muted" style={{ fontWeight: 600 }}>
            ← Voltar à lista
          </Link>
          <button type="button" className="btn-ghost" onClick={() => void toggleFavorite()}>
            {favoriteId ? "Remover dos favoritos" : "Salvar nos favoritos"}
          </button>
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ textDecoration: "none" }}
            >
              Ver no Google Maps
            </a>
          ) : null}
        </div>

        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", margin: 0 }}>{clinic.name}</h1>
            {clinic.isVerified ? (
              <span className="badge badge-green">Verificada</span>
            ) : (
              <span className="badge">Comunidade</span>
            )}
            {clinic.isClaimed ? (
              <span className="badge badge-teal">Perfil reivindicado</span>
            ) : null}
          </div>
          <p className="muted" style={{ marginTop: 10, fontSize: 16 }}>
            {buildAddress(clinic)}
          </p>
          {summary && summary.reviewCount > 0 && summary.averageRating != null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <StarRating value={summary.averageRating} />
              <span style={{ fontWeight: 600 }}>
                {summary.averageRating.toFixed(1)} · {summary.reviewCount} avaliações
              </span>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12 }}>
              Ainda não há avaliações aprovadas nesta clínica.
            </p>
          )}
        </header>

        <div className="grid-2" style={{ gap: 24 }}>
          <section className="card" style={{ padding: 22 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Contato</h2>
            {phone ? (
              <p style={{ margin: "6px 0" }}>
                Telefone:{" "}
                <a href={`tel:${phoneDigits}`} style={{ fontWeight: 600 }}>
                  {phone}
                </a>
              </p>
            ) : null}
            {wa ? (
              <p style={{ margin: "6px 0" }}>
                WhatsApp:{" "}
                <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer">
                  {wa}
                </a>
              </p>
            ) : null}
            {!phone && !wa ? <p className="muted">Contato não informado.</p> : null}

            {token ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                {wa ? (
                  <button type="button" className="btn-primary" onClick={() => void sendContact("whatsapp")}>
                    Registrar interesse (WhatsApp)
                  </button>
                ) : null}
                {phone ? (
                  <button type="button" className="btn-ghost" onClick={() => void sendContact("phone")}>
                    Registrar interesse (telefone)
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 10 }}>
                <Link href={`/login?from=${encodeURIComponent(router.asPath)}`}>Entre</Link> para registrar interesse
                na clínica.
              </p>
            )}
            {contactMsg ? (
              <p style={{ marginTop: 12, color: "var(--color-primary)", fontWeight: 600 }}>{contactMsg}</p>
            ) : null}
          </section>

          <section className="card" style={{ padding: 22 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Profissionais</h2>
            {clinic.professionals.length === 0 ? (
              <p className="muted">Nenhum profissional listado.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {clinic.professionals.map((p) => (
                  <li key={p.id} style={{ marginBottom: 6 }}>
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {clinic.description ? (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18 }}>Sobre</h2>
            <p style={{ whiteSpace: "pre-wrap", maxWidth: 800 }}>{clinic.description}</p>
          </section>
        ) : null}

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18 }}>Avaliações da comunidade</h2>
          {reviews.length === 0 ? (
            <p className="muted">Nenhuma avaliação aprovada ainda.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {reviews.map((r) => (
                <li key={r.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{r.authorName}</strong>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  <p className="muted" style={{ margin: "6px 0", fontSize: 13 }}>
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  <p style={{ margin: 0 }}>{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
