import { useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Review = {
  id: string;
  clinicId: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
};

export default function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);

  async function load() {
    setItems(await apiRequest<Review[]>("/admin/reviews"));
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderate(id: string, status: "approved" | "rejected") {
    await apiRequest(`/admin/reviews/${id}/moderate`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    await load();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Moderação de avaliações</h1>
      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <strong>Nota {item.rating}</strong> - status: {item.status}
            <p>{item.comment}</p>
            <button onClick={() => void moderate(item.id, "approved")}>Aprovar</button>
            <button onClick={() => void moderate(item.id, "rejected")} style={{ marginLeft: 8 }}>
              Rejeitar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
