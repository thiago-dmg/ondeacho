import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type CatalogItem = { id: string; name: string; slug: string };

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
  description?: string | null;
  rating?: number;
  displayRating?: number | null;
  displayReviewCount?: number;
  acceptsOnline?: boolean;
  supportsTeaTdh?: boolean;
  specialties?: { id: string; name: string }[];
  insurances?: { id: string; name: string }[];
};

type ClinicForm = {
  name: string;
  city: string;
  neighborhood: string;
  addressLine: string;
  addressNumber: string;
  zipcode: string;
  phone: string;
  whatsappPhone: string;
  description: string;
  acceptsOnline: boolean;
  supportsTeaTdh: boolean;
  specialtyIds: string[];
  insuranceIds: string[];
};

function emptyForm(): ClinicForm {
  return {
    name: "",
    city: "",
    neighborhood: "",
    addressLine: "",
    addressNumber: "",
    zipcode: "",
    phone: "",
    whatsappPhone: "",
    description: "",
    acceptsOnline: false,
    supportsTeaTdh: true,
    specialtyIds: [],
    insuranceIds: []
  };
}

function clinicToForm(c: Clinic): ClinicForm {
  return {
    name: c.name,
    city: c.city,
    neighborhood: c.neighborhood ?? "",
    addressLine: c.addressLine ?? "",
    addressNumber: c.addressNumber ?? "",
    zipcode: c.zipcode ?? "",
    phone: c.phone ?? "",
    whatsappPhone: c.whatsappPhone ?? "",
    description: c.description ?? "",
    acceptsOnline: Boolean(c.acceptsOnline),
    supportsTeaTdh: c.supportsTeaTdh !== false,
    specialtyIds: c.specialties?.map((s) => s.id) ?? [],
    insuranceIds: c.insurances?.map((i) => i.id) ?? []
  };
}

function formToPayload(f: ClinicForm) {
  return {
    name: f.name.trim(),
    city: f.city.trim(),
    neighborhood: f.neighborhood.trim() || undefined,
    addressLine: f.addressLine.trim() || undefined,
    addressNumber: f.addressNumber.trim() || undefined,
    zipcode: f.zipcode.trim() || undefined,
    phone: f.phone.trim() || undefined,
    whatsappPhone: f.whatsappPhone.trim() || undefined,
    description: f.description.trim() || undefined,
    acceptsOnline: f.acceptsOnline,
    supportsTeaTdh: f.supportsTeaTdh,
    specialtyIds: f.specialtyIds.length ? f.specialtyIds : undefined,
    insuranceIds: f.insuranceIds.length ? f.insuranceIds : undefined
  };
}

function MultiSelectIds({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: CatalogItem[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  }
  return (
    <div className="oa-field" style={{ gridColumn: "1 / -1" }}>
      <span className="oa-label">{label}</span>
      <div className="oa-multiselect">
        {options.length === 0 ? (
          <span className="oa-muted">Nenhum item cadastrado.</span>
        ) : (
          options.map((o) => (
            <label key={o.id}>
              <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
              {o.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function ClinicFormFields({
  form,
  setForm,
  specialties,
  insurances
}: {
  form: ClinicForm;
  setForm: (f: ClinicForm | ((p: ClinicForm) => ClinicForm)) => void;
  specialties: CatalogItem[];
  insurances: CatalogItem[];
}) {
  return (
    <div className="oa-form-grid oa-form-grid--2">
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-name">
          Nome
        </label>
        <input
          id="clinic-name"
          className="oa-input"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-city">
          Cidade
        </label>
        <input
          id="clinic-city"
          className="oa-input"
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          required
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-neighborhood">
          Bairro
        </label>
        <input
          id="clinic-neighborhood"
          className="oa-input"
          value={form.neighborhood}
          onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-zip">
          CEP
        </label>
        <input
          id="clinic-zip"
          className="oa-input"
          value={form.zipcode}
          onChange={(e) => setForm((p) => ({ ...p, zipcode: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-addressLine">
          Logradouro
        </label>
        <input
          id="clinic-addressLine"
          className="oa-input"
          value={form.addressLine}
          onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-addressNumber">
          Número
        </label>
        <input
          id="clinic-addressNumber"
          className="oa-input"
          value={form.addressNumber}
          onChange={(e) => setForm((p) => ({ ...p, addressNumber: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-phone">
          Telefone
        </label>
        <input
          id="clinic-phone"
          className="oa-input"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="clinic-wa">
          WhatsApp
        </label>
        <input
          id="clinic-wa"
          className="oa-input"
          value={form.whatsappPhone}
          onChange={(e) => setForm((p) => ({ ...p, whatsappPhone: e.target.value }))}
        />
      </div>
      <div className="oa-field" style={{ justifyContent: "center" }}>
        <label className="oa-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.acceptsOnline}
            onChange={(e) => setForm((p) => ({ ...p, acceptsOnline: e.target.checked }))}
          />
          Atende online
        </label>
      </div>
      <div className="oa-field" style={{ justifyContent: "center" }}>
        <label className="oa-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.supportsTeaTdh}
            onChange={(e) => setForm((p) => ({ ...p, supportsTeaTdh: e.target.checked }))}
          />
          Apoio TEA/TDAH
        </label>
      </div>
      <div className="oa-field" style={{ gridColumn: "1 / -1" }}>
        <label className="oa-label" htmlFor="clinic-desc">
          Descrição
        </label>
        <textarea
          id="clinic-desc"
          className="oa-textarea"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      <MultiSelectIds
        label="Especialidades"
        options={specialties}
        value={form.specialtyIds}
        onChange={(specialtyIds) => setForm((p) => ({ ...p, specialtyIds }))}
      />
      <MultiSelectIds
        label="Convênios"
        options={insurances}
        value={form.insuranceIds}
        onChange={(insuranceIds) => setForm((p) => ({ ...p, insuranceIds }))}
      />
    </div>
  );
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [specialties, setSpecialties] = useState<CatalogItem[]>([]);
  const [insurances, setInsurances] = useState<CatalogItem[]>([]);
  const [createForm, setCreateForm] = useState<ClinicForm>(() => emptyForm());
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [editForm, setEditForm] = useState<ClinicForm>(() => emptyForm());
  const [error, setError] = useState("");

  async function loadAll() {
    const [clinicList, specList, insList] = await Promise.all([
      apiRequest<Clinic[]>("/admin/clinics"),
      apiRequest<CatalogItem[]>("/admin/specialties"),
      apiRequest<CatalogItem[]>("/admin/insurances")
    ]);
    setClinics(clinicList);
    setSpecialties(specList);
    setInsurances(insList);
  }

  useEffect(() => {
    void loadAll().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, []);

  async function createClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest<Clinic>("/admin/clinics", {
        method: "POST",
        body: JSON.stringify(formToPayload(createForm))
      });
      setCreateForm(emptyForm());
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar.");
    }
  }

  function openEdit(c: Clinic) {
    setEditing(c);
    setEditForm(clinicToForm(c));
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await apiRequest(`/admin/clinics/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(formToPayload(editForm))
      });
      setEditOpen(false);
      setEditing(null);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  async function removeClinic(id: string) {
    if (!window.confirm("Excluir esta clínica? Esta ação não pode ser desfeita.")) return;
    setError("");
    try {
      await apiRequest(`/admin/clinics/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  return (
    <AdminLayout
      title="Clínicas"
      description="Cadastre, edite e remova clínicas. Especialidades e convênios podem ser vinculados em lote."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-card" style={{ marginBottom: 24 }}>
        <h2 className="oa-card__title">Nova clínica</h2>
        <form onSubmit={(e) => void createClinic(e)}>
          <ClinicFormFields form={createForm} setForm={setCreateForm} specialties={specialties} insurances={insurances} />
          <div className="oa-form-actions">
            <button type="submit" className="oa-btn oa-btn--primary">
              Adicionar clínica
            </button>
          </div>
        </form>
      </div>

      <div className="oa-table-wrap">
        <table className="oa-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Local</th>
              <th>Nota (comunidade)</th>
              <th style={{ width: 200 }} aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div className="oa-muted" style={{ marginTop: 4 }}>
                    {c.phone ? `${c.phone} · ` : ""}
                    {c.specialties?.length ? `${c.specialties.length} esp. · ` : ""}
                    {c.insurances?.length ? `${c.insurances.length} conv.` : ""}
                  </div>
                </td>
                <td>
                  {c.city}
                  {c.neighborhood ? ` · ${c.neighborhood}` : ""}
                </td>
                <td>
                  {c.displayRating != null && c.displayRating !== undefined
                    ? `${Number(c.displayRating).toFixed(1)} (${c.displayReviewCount ?? 0} aval.)`
                    : "—"}
                </td>
                <td>
                  <div className="oa-table__actions">
                    <button type="button" className="oa-btn oa-btn--secondary oa-btn--sm" onClick={() => openEdit(c)}>
                      Editar
                    </button>
                    <button type="button" className="oa-btn oa-btn--danger oa-btn--sm" onClick={() => void removeClinic(c.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editOpen}
        title="Editar clínica"
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        size="lg"
        footer={
          <>
            <button type="button" className="oa-btn oa-btn--ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="oa-btn oa-btn--primary" onClick={() => void saveEdit()}>
              Salvar alterações
            </button>
          </>
        }
      >
        <ClinicFormFields form={editForm} setForm={setEditForm} specialties={specialties} insurances={insurances} />
      </Modal>
    </AdminLayout>
  );
}
