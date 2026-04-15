import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAdminToken } from "../src/lib/auth";
import { apiRequest } from "../src/services/api";

export default function DashboardPage() {
  const [usersCount, setUsersCount] = useState<number | string>("-");
  const [clinicsCount, setClinicsCount] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

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
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Dashboard</h1>
      <p>
        <Link href="/clinics">Gerenciar clínicas</Link>
      </p>
      <p>
        <Link href="/professionals">Gerenciar profissionais</Link>
      </p>
      <p>
        <Link href="/specialties">Gerenciar especialidades</Link>
      </p>
      <p>
        <Link href="/insurances">Gerenciar convênios</Link>
      </p>
      <p>
        <Link href="/reviews">Moderar avaliações</Link>
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minWidth: 180 }}
          >
            <strong>{metric.label}</strong>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
