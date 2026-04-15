import { useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Suggestion = {
  id: string;
  name: string;
  targetType: "clinica" | "profissional";
  city: string;
  phone?: string | null;
  suggestedByName: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  createdAt: string;
};

export default function ClinicSuggestionsPage() {
  const [items, setItems] = useState<Suggestion[]>([]);

  async function load() {
    const data = await apiRequest<Suggestion[]>("/admin/clinic-suggestions?status=PENDENTE");
    setItems(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(id: string) {
    await apiRequest(`/admin/clinic-suggestions/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({})
    });
    await load();
  }

  async function reject(id: string) {
    const note = window.prompt("Motivo da rejeição (opcional)") ?? "";
    await apiRequest(`/admin/clinic-suggestions/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ note })
    });
    await load();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Sugestões de clínicas/profissionais</h1>
      <p>Total pendente: {items.length}</p>
      <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <strong>{item.name}</strong> ({item.targetType}) - {item.city}
            <br />
            {item.phone ? `Telefone: ${item.phone} • ` : ""}
            Sugerido por: {item.suggestedByName}
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
