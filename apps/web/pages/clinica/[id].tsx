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
  title
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={title}
      aria-pressed={active}
      title={title}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: active ? "none" : "2px solid rgba(13, 148, 136, 0.5)",
        background: active ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#fff",
        color: active ? "#fff" : "#0f766e",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: 1,
        boxShadow: active ? "0 6px 20px rgba(13, 148, 136, 0.35)" : "none",
        transition: "transform 0.12s ease, box-shadow 0.15s ease"
      }}
    >
      <svg width={26} height={26} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
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
      const [raw, sum, revs] = await Promise.all([
        apiRequest<Record<string, unknown>>(`/listings/${id}`, { skipAuth: !authToken }),
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
          <section className="card clinica-detail-contato" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 0 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 22 }}>Contato e ações</h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
                paddingBottom: 18,
                borderBottom: "1px solid var(--color-divider)"
              }}
            >
              <FavoriteHeartButton
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
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#134e4a" }}>Favoritos</p>
                <p className="muted" style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.45 }}>
                  {!hasSession
                    ? "Entre para salvar esta clínica e acessar mais rápido depois."
                    : isOwner
                      ? "Como dono do perfil, use o coração para marcar sua clínica nos favoritos (igual ao app)."
                      : "Salve a clínica nos favoritos para encontrar depois com facilidade."}
                </p>
              </div>
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
          </section>

          <section
            className="card clinica-detail-profissionais"
            style={{
              padding: 22,
              display: "flex",
              flexDirection: "column",
              minHeight: 0
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 22 }}>Profissionais</h2>
            <div style={{ flex: 1, minHeight: 100 }}>
              {clinic.professionals.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Nenhum profissional listado.
                </p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {clinic.professionals.map((p, idx) => (
                    <li
                      key={p.id}
                      style={{
                        marginBottom: idx < clinic.professionals.length - 1 ? 14 : 0,
                        paddingBottom: idx < clinic.professionals.length - 1 ? 14 : 0,
                        borderBottom:
                          idx < clinic.professionals.length - 1 ? "1px solid var(--color-divider)" : undefined
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          lineHeight: 1.35,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={p.crm ? `${p.name} — CRM ${p.crm}` : p.name}
                      >
                        <span style={{ fontWeight: 700, color: "#134e4a" }}>{p.name}</span>
                        {p.crm ? (
                          <span style={{ fontWeight: 400, color: "var(--color-muted)", marginLeft: 8 }}>
                            — CRM {p.crm}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card clinica-detail-redes" style={{ padding: 22 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 22 }}>Site e redes</h2>
            {!hasSocial ? (
              <p className="muted" style={{ margin: 0 }}>
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
          </section>

          {clinic && embedSrc ? (
            <section
              className="card clinica-detail-mapa"
              style={{
                padding: 0,
                overflow: "hidden",
                border: "1px solid var(--color-divider)",
                boxShadow: "0 6px 20px rgba(15, 118, 110, 0.06)"
              }}
            >
              <div style={{ padding: "16px 18px 0" }}>
                <h2 style={{ fontSize: 18, margin: 0 }}>Mapa</h2>
                <p className="muted" style={{ fontSize: 13, margin: "6px 0 0", lineHeight: 1.45 }}>
                  Localização aproximada a partir do endereço cadastrado.
                </p>
              </div>
              <div
                style={{
                  marginTop: 10,
                  width: "100%",
                  maxWidth: 480,
                  marginLeft: "auto",
                  marginRight: "auto",
                  aspectRatio: "2.2 / 1",
                  minHeight: 120,
                  maxHeight: 160,
                  background: "var(--color-surface-muted, #e8f4f2)"
                }}
              >
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
          <section style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Sobre</h2>
            <p style={{ whiteSpace: "pre-wrap", maxWidth: 800, margin: 0, lineHeight: 1.6 }}>{clinic.description}</p>
          </section>
        ) : null}

        <section style={{ marginTop: 28 }}>
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
