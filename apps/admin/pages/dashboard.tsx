import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { clearAdminToken } from "../src/lib/auth";
import { apiRequest } from "../src/services/api";

const LINKS: { href: string; label: string; hint: string }[] = [
  { href: "/clinics", label: "Clínicas", hint: "CRUD completo, vínculos e descrição" },
  { href: "/professionals", label: "Profissionais", hint: "Especialidades, convênios e clínica" },
  { href: "/specialties", label: "Especialidades", hint: "Catálogo exibido nos filtros" },
  { href: "/insurances", label: "Convênios", hint: "Planos para filtros e fichas" },
  { href: "/reviews", label: "Avaliações", hint: "Moderação e exclusão" },
  { href: "/clinic-suggestions", label: "Sugestões da comunidade", hint: "Aprovar ou rejeitar cadastros sugeridos" },
  { href: "/profile-claims", label: "Reivindicações de perfil", hint: "Donos de clínicas e profissionais" }
];

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState<number | string>("—");
  const [clinicsCount, setClinicsCount] = useState<number | string>("—");
  const [pendingReviews, setPendingReviews] = useState<number | string>("—");

  useEffect(() => {
    async function loadMetrics() {
      try {
        const overview = await apiRequest<{
          users: number;
          clinics: number;
          pendingReviews: number;
        }>("/admin/metrics/overview");
        setUsersCount(overview.users);
        setClinicsCount(overview.clinics);
        setPendingReviews(overview.pendingReviews);
      } catch {
        clearAdminToken();
      }
    }
    void loadMetrics();
  }, []);

  const metrics = [
    { label: "Usuários", value: usersCount },
    { label: "Clínicas", value: clinicsCount },
    { label: "Avaliações pendentes", value: pendingReviews }
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Visão geral do catálogo e atalhos para cada área administrativa."
    >
      <div className="oa-metric-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="oa-metric">
            <p className="oa-metric__label">{metric.label}</p>
            <p className="oa-metric__value">{metric.value}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px" }}>Gerenciamento</h2>
      <div className="oa-dash-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <span style={{ flex: 1 }}>
              {link.label}
              <span className="oa-muted" style={{ display: "block", fontWeight: 500, marginTop: 4 }}>
                {link.hint}
              </span>
            </span>
            <span aria-hidden style={{ color: "var(--oa-teal)", fontSize: "1.25rem" }}>
              →
            </span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
