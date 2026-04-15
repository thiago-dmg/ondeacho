import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Professional = {
  id: string;
  name: string;
  city: string;
  rating: number;
};

export default function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  async function load() {
    setItems(await apiRequest<Professional[]>("/admin/professionals"));
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiRequest("/admin/professionals", {
      method: "POST",
      body: JSON.stringify({ name, city })
    });
    setName("");
    setCity("");
    await load();
  }

  async function remove(id: string) {
    await apiRequest(`/admin/professionals/${id}`, { method: "DELETE" });
    await load();
  }

  async function edit(item: Professional) {
    const nextName = window.prompt("Novo nome do profissional", item.name);
    if (!nextName) return;
    const nextCity = window.prompt("Nova cidade", item.city);
    if (!nextCity) return;
    await apiRequest(`/admin/professionals/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: nextName, city: nextCity })
    });
    await load();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Profissionais</h1>
      <form onSubmit={create} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" required />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - {item.city} (nota {Number(item.rating).toFixed(1)})
            <button onClick={() => void edit(item)} style={{ marginLeft: 8 }}>
              Editar
            </button>
            <button onClick={() => void remove(item.id)} style={{ marginLeft: 8 }}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
