import { useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Claim = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  clinicId?: string | null;
  professionalId?: string | null;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  createdAt: string;
};

export default function ProfileClaimsPage() {
  const [items, setItems] = useState<Claim[]>([]);

  async function load() {
    const data = await apiRequest<Claim[]>("/admin/profile-claims?status=PENDENTE");
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(id: string) {
    await apiRequest(`/admin/profile-claims/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({})
    });
    await load();
  }

  async function reject(id: string) {
    const note = window.prompt("Motivo da rejeição (opcional)") ?? "";
    await apiRequest(`/admin/profile-claims/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ note })
    });
    await load();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Reivindicações de perfil</h1>
      <p>Total pendente: {items.length}</p>
      <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <strong>{item.requesterName}</strong> - {item.requesterEmail}
            <br />
            Telefone: {item.requesterPhone}
            <br />
            Perfil alvo: {item.clinicId ? `Clínica ${item.clinicId}` : `Profissional ${item.professionalId}`}
            <br />
            <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => void approve(item.id)}>Aprovar</button>
              <button onClick={() => void reject(item.id)} style={{ marginLeft: 8 }}>
                Rejeitar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
