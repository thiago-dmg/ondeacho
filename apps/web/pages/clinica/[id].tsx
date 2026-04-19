import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteLayout } from "../../src/components/SiteLayout";
import { StarRating } from "../../src/components/StarRating";
import { apiRequest } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth-context";
import { parseClinic, parseReview } from "../../src/lib/mappers";
import { getWebToken } from "../../src/lib/token";
import type { ClinicListing, FavoriteRow, PublicReview, ReviewSummary } from "../../src/lib/types";

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function cityWithUf(clinic: ClinicListing): string {
  const city = (clinic.city ?? "").trim();
  const uf = (clinic.stateUf ?? "").trim().toUpperCase();
  if (!uf) {
    return city;
  }
  const upper = city.toUpperCase();
  if (upper.endsWith(`, ${uf}`) || upper.endsWith(`-${uf}`)) {
    return city;
  }
  return city ? `${city}, ${uf}` : uf;
}

function buildAddress(clinic: ClinicListing): string {
  const street = [clinic.addressLine, clinic.addressNumber].filter(Boolean).join(", ");
  const loc = [clinic.neighborhood, cityWithUf(clinic)].filter(Boolean).join(" — ");
  const primary = [street, loc].filter((s) => s.length > 0).join(" • ");
  if (!primary) {
    return cityWithUf(clinic);
  }
  if (clinic.zipcode) {
    return `${primary} • CEP ${clinic.zipcode}`;
  }
  return primary;
}

function mapsEmbedSrc(clinic: ClinicListing): string {
  const q = buildAddress(clinic);
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=pt&z=15&output=embed`;
}

function externalHref(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) {
    return null;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  if (t.startsWith("//")) {
    return `https:${t}`;
  }
  return `https://${t}`;
}

function instagramHref(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) {
    return null;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  const h = t.replace(/^@+/, "").replace(/^\//, "");
  if (!h) {
    return null;
  }
  return `https://www.instagram.com/${h}`;
}

function facebookHref(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) {
    return null;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  const h = t.replace(/^@+/, "").replace(/^\//, "");
  if (!h) {
    return null;
  }
  return `https://www.facebook.com/${h}`;
}

function SocialIconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: "1px solid rgba(13, 148, 136, 0.45)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#0f766e",
        background: "#fff",
        textDecoration: "none",
        boxSizing: "border-box",
        transition: "background 0.15s ease, border-color 0.15s ease, transform 0.12s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(13, 148, 136, 0.08)";
        e.currentTarget.style.borderColor = "#0d9488";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "rgba(13, 148, 136, 0.45)";
      }}
    >
      {children}
    </a>
  );
}

function IconGlobe() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-9h3l.45-3.5H13.5V7.8c0-1 .28-1.68 1.72-1.68h1.83V3.14A24.65 24.65 0 0 0 14.45 3c-2.65 0-4.45 1.62-4.45 4.6V9.5H7v3.5h3V22h3.5z" />
    </svg>
  );
}

function FavoriteHeartButton({
  active,
  disabled,
  onClick,
  title,
  size = "default"
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  size?: "default" | "compact";
}) {
  const dim = size === "compact" ? 40 : 48;
  const icon = size === "compact" ? 22 : 26;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={title}
      aria-pressed={active}
      title={title}
      style={{
        width: dim,
        height: dim,
        flexShrink: 0,
        borderRadius: "50%",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: active ? "none" : "2px solid rgba(13, 148, 136, 0.45)",
        background: active ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#fff",
        color: active ? "#fff" : "#0f766e",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: 1,
        boxShadow: active && size === "default" ? "0 4px 14px rgba(13, 148, 136, 0.28)" : "none",
        transition: "transform 0.12s ease, box-shadow 0.15s ease"
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function normalizeReviewListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data !== null && typeof data === "object") {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items;
    }
  }
  return [];
}

export default function ClinicaDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const { token: sessionFromContext } = useAuth();

  const [clinic, setClinic] = useState<ClinicListing | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [contactMsg, setContactMsg] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  const mapsUrl = useMemo(() => {
    if (!clinic) {
      return "";
    }
    const q = buildAddress(clinic);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [clinic]);

  const embedSrc = useMemo(() => (clinic ? mapsEmbedSrc(clinic) : ""), [clinic]);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const authToken = getWebToken();
      const [raw, sum, revsPayload] = await Promise.all([
        apiRequest<Record<string, unknown>>(`/listings/${id}`, { skipAuth: !authToken }),
        apiRequest<ReviewSummary>(`/reviews/listing/${id}/summary`, { skipAuth: true }),
        apiRequest<unknown>(`/reviews/listing/${id}`, { skipAuth: true })
      ]);
      setClinic(parseClinic(raw));
      setSummary(sum);
      const revList = normalizeReviewListPayload(revsPayload);
      setReviews(
        revList
          .filter((r): r is Record<string, unknown> => r !== null && typeof r === "object")
          .map(parseReview)
      );

      if (authToken) {
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
  }, [id]);

  useEffect(() => {
    void load();
  }, [load, sessionFromContext]);

  const submitReview = async () => {
    if (!clinic || !getWebToken()) {
      void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewMsg("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    const text = reviewComment.trim();
    if (text.length < 3) {
      setReviewMsg("Escreva um comentário (mínimo 3 caracteres).");
      return;
    }
    setReviewMsg(null);
    setReviewBusy(true);
    try {
      await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({ clinicId: clinic.id, rating: reviewRating, comment: text })
      });
      setReviewComment("");
      setReviewRating(0);
      setReviewMsg("Obrigado! Sua avaliação foi enviada e aguarda moderação.");
      const [sum, revsPayload] = await Promise.all([
        apiRequest<ReviewSummary>(`/reviews/listing/${clinic.id}/summary`, { skipAuth: true }),
        apiRequest<unknown>(`/reviews/listing/${clinic.id}`, { skipAuth: true })
      ]);
      setSummary(sum);
      const revList = normalizeReviewListPayload(revsPayload);
      setReviews(
        revList
          .filter((r): r is Record<string, unknown> => r !== null && typeof r === "object")
          .map(parseReview)
      );
    } catch (e) {
      setReviewMsg(e instanceof Error ? e.message : "Não foi possível enviar a avaliação.");
    } finally {
      setReviewBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (!getWebToken() || !clinic) {
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

  const hasSession = Boolean(getWebToken());
  const isOwner = clinic.viewerIsOwner === true;
  const siteHref = externalHref(clinic.websiteUrl);
  const igHref = instagramHref(clinic.instagramUrl);
  const fbHref = facebookHref(clinic.facebookUrl);
  const hasSocial = Boolean(siteHref || igHref || fbHref);

  return (
    <SiteLayout title={clinic.name} description={clinic.description ?? undefined}>
      <section
        style={{
          background: "linear-gradient(180deg, #ecfdf5 0%, var(--color-bg) 52%)",
          padding: "28px 0 8px",
          marginBottom: 8
        }}
      >
        <div className="container">
          <div style={{ marginBottom: 14 }}>
            <Link href="/clinicas" className="muted" style={{ fontWeight: 600 }}>
              ← Voltar à lista
            </Link>
          </div>

          <header style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <h1 style={{ fontSize: "clamp(1.35rem, 3vw, 1.95rem)", margin: 0, lineHeight: 1.2 }}>{clinic.name}</h1>
            {clinic.isVerified ? (
              <span className="badge badge-green">Verificada</span>
            ) : (
              <span className="badge">Comunidade</span>
            )}
            {clinic.isClaimed ? (
              <span className="badge badge-teal">Perfil reivindicado</span>
            ) : null}
          </div>
          <p className="muted" style={{ marginTop: 10, fontSize: 17, lineHeight: 1.55, maxWidth: 720 }}>
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
            <p className="muted" style={{ marginTop: 12, marginBottom: 0, fontSize: 15 }}>
              Ainda não há avaliações aprovadas nesta clínica.
            </p>
          )}
          </header>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div className="clinica-detail-layout">
          <section className="card clinica-detail-comunicacao" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 14,
                paddingBottom: 16,
                borderBottom: "1px solid var(--color-divider)"
              }}
            >
              <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.25, flex: "1 1 auto", minWidth: 0 }}>
                Contato e redes
              </h2>
              <FavoriteHeartButton
                size="compact"
                active={Boolean(favoriteId)}
                disabled={false}
                title={
                  !hasSession
                    ? "Entrar para usar favoritos"
                    : favoriteId
                      ? "Remover dos favoritos"
                      : "Salvar nos favoritos"
                }
                onClick={() => void toggleFavorite()}
              />
            </div>
            <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--color-divider)" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#134e4a" }}>Favoritos</p>
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.45 }}>
                {!hasSession
                  ? "Entre para salvar esta clínica e acessar mais rápido depois."
                  : isOwner
                    ? "Como dono do perfil, use o coração acima para marcar sua clínica nos favoritos (igual ao app)."
                    : "Use o coração acima para salvar a clínica e encontrar depois com facilidade."}
              </p>
            </div>

            {phone ? (
              <p style={{ margin: "8px 0", fontSize: 15, lineHeight: 1.5, color: "var(--color-text)" }}>
                <span className="muted" style={{ marginRight: 8 }}>Telefone</span>
                <a href={`tel:${phoneDigits}`} className="inline-action-link">
                  {phone}
                </a>
              </p>
            ) : null}
            {wa ? (
              <p style={{ margin: "8px 0", fontSize: 15, lineHeight: 1.5, color: "var(--color-text)" }}>
                <span className="muted" style={{ marginRight: 8 }}>WhatsApp</span>
                <a href={`https://wa.me/${waDigits}`} className="inline-action-link" target="_blank" rel="noopener noreferrer">
                  {wa}
                </a>
              </p>
            ) : null}
            {!phone && !wa ? <p className="muted">Contato não informado.</p> : null}

            {hasSession && isOwner ? (
              <div
                style={{
                  marginTop: 18,
                  padding: "16px 14px",
                  borderRadius: 12,
                  background: "rgba(13, 148, 136, 0.07)",
                  border: "1px solid rgba(13, 148, 136, 0.22)"
                }}
              >
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#134e4a" }}>
                  <strong>Área do proprietário.</strong> Quem visita vê os contatos e redes abaixo. Para alterar os
                  dados, use o painel de administração ou o aplicativo OndeAcho.
                </p>
              </div>
            ) : !isOwner ? (
              <p className="muted" style={{ marginTop: 18, marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>
                {clinic.isClaimed ? (
                  <>
                    Este perfil já foi reivindicado. Para correção de dados ou dúvidas, use a página de{" "}
                    <Link href="/suporte">suporte</Link>.
                  </>
                ) : hasSession ? (
                  <>
                    Você é o responsável ou faz parte da equipe desta clínica? Solicite a reivindicação pelo{" "}
                    <Link href="/suporte">suporte</Link> ou pelo aplicativo OndeAcho.
                  </>
                ) : (
                  <>
                    Você é o responsável ou faz parte da equipe desta clínica?{" "}
                    <Link href={`/login?from=${encodeURIComponent(router.asPath)}`}>Entre na sua conta</Link> e acesse o{" "}
                    <Link href="/suporte">suporte</Link> para solicitar a reivindicação do perfil.
                  </>
                )}
              </p>
            ) : null}
            {contactMsg ? (
              <p style={{ marginTop: 14, marginBottom: 0, color: "var(--color-primary)", fontWeight: 600 }}>{contactMsg}</p>
            ) : null}

            <div className="clinica-detail-comunicacao__redes">
              <h3>Site e redes</h3>
              {!hasSocial ? (
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  Nenhum site ou rede social cadastrado.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  {siteHref ? (
                    <SocialIconLink href={siteHref} label="Abrir site no navegador">
                      <IconGlobe />
                    </SocialIconLink>
                  ) : null}
                  {igHref ? (
                    <SocialIconLink href={igHref} label="Abrir Instagram">
                      <IconInstagram />
                    </SocialIconLink>
                  ) : null}
                  {fbHref ? (
                    <SocialIconLink href={fbHref} label="Abrir Facebook">
                      <IconFacebook />
                    </SocialIconLink>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <section className="clinica-detail-profissionais" aria-labelledby="clinica-profissionais-heading">
            <h2 id="clinica-profissionais-heading" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>
              Profissionais
            </h2>
            {clinic.professionals.length === 0 ? (
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                Nenhum profissional listado.
              </p>
            ) : (
              <ul className="clinica-pro-list">
                {clinic.professionals.map((p) => (
                  <li key={p.id}>
                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.35,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={p.crm ? `${p.name} — ${p.crm}` : p.name}
                    >
                      <span style={{ fontWeight: 600, color: "#134e4a" }}>{p.name}</span>
                      {p.crm ? (
                        <span style={{ fontWeight: 400, color: "var(--color-muted)", marginLeft: 8 }}>— {p.crm}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {clinic && embedSrc ? (
            <section
              className="card clinica-detail-mapa"
              style={{
                padding: 0,
                overflow: "hidden",
                border: "1px solid var(--color-divider)",
                boxShadow: "0 1px 3px var(--color-shadow)"
              }}
            >
              <div style={{ padding: "14px 18px 0" }}>
                <h2 style={{ fontSize: 18, margin: 0, letterSpacing: "-0.02em" }}>Mapa</h2>
                <p className="muted" style={{ fontSize: 13, margin: "6px 0 0", lineHeight: 1.45 }}>
                  Localização aproximada a partir do endereço cadastrado.
                </p>
              </div>
              <div className="clinica-mapa-frame" style={{ marginTop: 8 }}>
                <iframe
                  title={`Mapa — ${clinic.name}`}
                  src={embedSrc}
                  loading="lazy"
                  style={{ border: 0, width: "100%", height: "100%", display: "block" }}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              {mapsUrl ? (
                <div style={{ padding: "10px 18px 14px" }}>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ display: "inline-block", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        {clinic.description ? (
          <section className="card" style={{ marginTop: 28, padding: 22 }}>
            <h2 style={{ fontSize: 22, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Sobre</h2>
            <p
              style={{
                whiteSpace: "pre-wrap",
                maxWidth: 720,
                margin: 0,
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--color-text)"
              }}
            >
              {clinic.description}
            </p>
          </section>
        ) : null}

        <section className="card" style={{ marginTop: 28, padding: 22 }}>
          <h2 style={{ fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Avaliações da comunidade</h2>
          <p className="muted" style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.5 }}>
            Notas e comentários aprovados pela moderação. Envie a sua experiência — publicamos após análise.
          </p>
          {reviews.length === 0 ? (
            <p className="muted" style={{ margin: "0 0 20px" }}>
              Nenhuma avaliação aprovada ainda nesta página.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}>
              {reviews.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid var(--color-divider)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{r.authorName}</strong>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  <p className="muted" style={{ margin: "6px 0", fontSize: 13 }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "—"}
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                </li>
              ))}
            </ul>
          )}

          <div
            style={{
              marginTop: reviews.length === 0 ? 0 : 8,
              paddingTop: 18,
              borderTop: "1px solid var(--color-divider)"
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#134e4a" }}>Deixe sua avaliação</h3>
            {!hasSession ? (
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                <Link href={`/login?from=${encodeURIComponent(router.asPath)}`}>Entre na sua conta</Link> para enviar uma
                avaliação desta clínica.
              </p>
            ) : isOwner ? (
              <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                Contas vinculadas a este perfil não publicam avaliação na própria ficha. Outros usuários podem comentar
                após o login.
              </p>
            ) : (
              <>
                <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>
                  Nota de 1 a 5 e um comentário curto. Cada conta pode enviar uma avaliação por clínica.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }} role="group" aria-label="Nota">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setReviewRating(n);
                        setReviewMsg(null);
                      }}
                      style={{
                        minWidth: 40,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border:
                          reviewRating === n ? "2px solid var(--color-primary)" : "1px solid var(--color-divider)",
                        background: reviewRating === n ? "rgba(13, 148, 136, 0.1)" : "#fff",
                        color: "#0f766e",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}
                    >
                      {n} ★
                    </button>
                  ))}
                </div>
                <label style={{ display: "block", marginBottom: 10 }}>
                  <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                    Comentário
                  </span>
                  <textarea
                    className="input"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => {
                      setReviewComment(e.target.value);
                      setReviewMsg(null);
                    }}
                    placeholder="Como foi o atendimento, espera, convênio…"
                    style={{ minHeight: 100, resize: "vertical" }}
                  />
                </label>
                <button type="button" className="btn-primary" disabled={reviewBusy} onClick={() => void submitReview()}>
                  {reviewBusy ? "Enviando…" : "Enviar avaliação"}
                </button>
                {reviewMsg ? (
                  <p
                    style={{
                      marginTop: 12,
                      marginBottom: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: reviewMsg.startsWith("Obrigado") ? "#0f766e" : "#b45309"
                    }}
                  >
                    {reviewMsg}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
