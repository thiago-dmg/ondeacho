import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Clinic = {
  id: string;
  name: string;
  city: string;
  rating: number;
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  async function loadClinics() {
    const data = await apiRequest<Clinic[]>("/admin/clinics");
    setClinics(data);
  }

  useEffect(() => {
    void loadClinics();
  }, []);

  async function createClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiRequest<Clinic>("/admin/clinics", {
      method: "POST",
      body: JSON.stringify({ name, city })
    });
    setName("");
    setCity("");
    await loadClinics();
  }

  async function editClinic(clinic: Clinic) {
    const nextName = window.prompt("Novo nome da clínica", clinic.name);
    if (!nextName) return;
    const nextCity = window.prompt("Nova cidade", clinic.city);
    if (!nextCity) return;
    await apiRequest(`/admin/clinics/${clinic.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: nextName, city: nextCity })
    });
    await loadClinics();
  }

  async function removeClinic(id: string) {
    await apiRequest(`/admin/clinics/${id}`, { method: "DELETE" });
    await loadClinics();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
      <h1>Clínicas</h1>
      <form onSubmit={createClinic} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" required />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {clinics.map((clinic) => (
          <li key={clinic.id}>
            {clinic.name} - {clinic.city} (nota {Number(clinic.rating).toFixed(1)})
            <button onClick={() => void editClinic(clinic)} style={{ marginLeft: 8 }}>
              Editar
            </button>
            <button onClick={() => void removeClinic(clinic.id)} style={{ marginLeft: 8 }}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
