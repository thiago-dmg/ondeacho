import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../src/services/api";

type Clinic = {
  id: string;
  name: string;
  city: string;
  neighborhood?: string | null;
  addressLine?: string | null;
  addressNumber?: string | null;
  zipcode?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  rating: number;
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

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
      body: JSON.stringify({
        name,
        city,
        phone: phone || undefined,
        addressLine: addressLine || undefined,
        addressNumber: addressNumber || undefined,
        neighborhood: neighborhood || undefined
      })
    });
    setName("");
    setCity("");
    setPhone("");
    setAddressLine("");
    setAddressNumber("");
    setNeighborhood("");
    await loadClinics();
  }

  async function editClinic(clinic: Clinic) {
    const nextName = window.prompt("Novo nome da clínica", clinic.name);
    if (!nextName) return;
    const nextCity = window.prompt("Nova cidade", clinic.city);
    if (!nextCity) return;
    const nextPhone = window.prompt("Novo telefone", clinic.phone ?? "");
    if (nextPhone === null) return;
    const nextAddressLine = window.prompt("Nova rua/avenida", clinic.addressLine ?? "");
    if (nextAddressLine === null) return;
    const nextAddressNumber = window.prompt("Novo número", clinic.addressNumber ?? "");
    if (nextAddressNumber === null) return;
    const nextNeighborhood = window.prompt("Novo bairro", clinic.neighborhood ?? "");
    if (nextNeighborhood === null) return;
    await apiRequest(`/admin/clinics/${clinic.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: nextName,
        city: nextCity,
        phone: nextPhone || undefined,
        addressLine: nextAddressLine || undefined,
        addressNumber: nextAddressNumber || undefined,
        neighborhood: nextNeighborhood || undefined
      })
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
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" />
        <input
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Rua/Avenida"
        />
        <input
          value={addressNumber}
          onChange={(e) => setAddressNumber(e.target.value)}
          placeholder="Número"
        />
        <input
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Bairro"
        />
        <button type="submit">Adicionar</button>
      </form>
      <ul>
        {clinics.map((clinic) => (
          <li key={clinic.id}>
            {clinic.name} - {clinic.city} (nota {Number(clinic.rating).toFixed(1)})
            {clinic.phone ? ` • Tel: ${clinic.phone}` : ""}
            {clinic.addressLine ? ` • ${clinic.addressLine}` : ""}
            {clinic.addressNumber ? `, ${clinic.addressNumber}` : ""}
            {clinic.neighborhood ? ` - ${clinic.neighborhood}` : ""}
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
