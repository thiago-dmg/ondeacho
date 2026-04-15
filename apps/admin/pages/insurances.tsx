import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Insurance = { id: string; slug: string; name: string };

export default function InsurancesPage() {
  const [items, setItems] = useState<Insurance[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");

  async function load() {
    setItems(await apiRequest<Insurance[]>("/admin/insurances"));
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiRequest("/admin/insurances", {
      method: "POST",
      body: JSON.stringify({ slug, name })
    });
    setSlug("");
    setName("");
    await load();
  }

  async function remove(id: string) {
    await apiRequest(`/admin/insurances/${id}`, { method: "DELETE" });
    await load();
  }

  async function edit(item: Insurance) {
    const nextSlug = window.prompt("Novo slug", item.slug);
    if (!nextSlug) return;
    const nextName = window.prompt("Novo nome", item.name);
    if (!nextName) return;
    await apiRequest(`/admin/insurances/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ slug: nextSlug, name: nextName })
    });
    await load();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Convênios</h1>
      <form onSubmit={create} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" required />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="nome" required />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} ({item.slug})
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
