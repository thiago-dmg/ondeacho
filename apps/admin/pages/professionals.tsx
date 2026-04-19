import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { AdminPagination } from "../src/components/AdminPagination";
import { AdminSearchField } from "../src/components/AdminSearchField";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";
import { fetchViaCep } from "../src/services/viacep";

type CatalogItem = { id: string; name: string; slug: string };

type ClinicOption = { id: string; name: string; city: string };

type Professional = {
  id: string;
  name: string;
  crm?: string | null;
  city: string;
  rating: number;
  neighborhood?: string | null;
  clinicId?: string | null;
  clinic?: { id: string; name: string } | null;
  acceptsOnline?: boolean;
  supportsTeaTdh?: boolean;
  specialties?: { id: string; name: string }[];
  insurances?: { id: string; name: string }[];
};

type ProfForm = {
  name: string;
  crm: string;
  city: string;
  neighborhood: string;
  clinicId: string;
  rating: string;
  acceptsOnline: boolean;
  supportsTeaTdh: boolean;
  specialtyIds: string[];
  insuranceIds: string[];
};

function emptyForm(): ProfForm {
  return {
    name: "",
    crm: "",
    city: "",
    neighborhood: "",
    clinicId: "",
    rating: "0",
    acceptsOnline: false,
    supportsTeaTdh: true,
    specialtyIds: [],
    insuranceIds: []
  };
}

function profToForm(p: Professional): ProfForm {
  return {
    name: p.name,
    crm: p.crm ?? "",
    city: p.city,
    neighborhood: p.neighborhood ?? "",
    clinicId: p.clinicId ?? "",
    rating: String(p.rating ?? 0),
    acceptsOnline: Boolean(p.acceptsOnline),
    supportsTeaTdh: p.supportsTeaTdh !== false,
    specialtyIds: p.specialties?.map((s) => s.id) ?? [],
    insuranceIds: p.insurances?.map((i) => i.id) ?? []
  };
}

type ProfessionalsPageResponse = {
  items: Professional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function formToPayload(f: ProfForm) {
  const rating = Math.min(5, Math.max(0, Number.parseFloat(f.rating) || 0));
  return {
    name: f.name.trim(),
    crm: f.crm.trim() || undefined,
    city: f.city.trim(),
    neighborhood: f.neighborhood.trim() || undefined,
    clinicId: f.clinicId.trim() || undefined,
    rating,
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

function ProfFormFields({
  form,
  setForm,
  clinics,
  specialties,
  insurances
}: {
  form: ProfForm;
  setForm: (f: ProfForm | ((p: ProfForm) => ProfForm)) => void;
  clinics: ClinicOption[];
  specialties: CatalogItem[];
  insurances: CatalogItem[];
}) {
  const [cepLookup, setCepLookup] = useState("");
  const cepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (cepTimer.current) {
      clearTimeout(cepTimer.current);
    }
    const digits = cepLookup.replace(/\D/g, "");
    if (digits.length !== 8) {
      return;
    }
    cepTimer.current = setTimeout(() => {
      void (async () => {
        const r = await fetchViaCep(digits);
        if (!r) {
          return;
        }
        const city =
          r.localidade && r.uf ? `${r.localidade}, ${r.uf}` : r.localidade || "";
        setForm((p) => ({
          ...p,
          ...(city ? { city } : {}),
          ...(r.bairro ? { neighborhood: r.bairro } : {})
        }));
      })();
    }, 450);
    return () => {
      if (cepTimer.current) {
        clearTimeout(cepTimer.current);
      }
    };
  }, [cepLookup, setForm]);

  return (
    <div className="oa-form-grid oa-form-grid--2">
      <div className="oa-field">
        <label className="oa-label" htmlFor="pf-name">
          Nome
        </label>
        <input
          id="pf-name"
          className="oa-input"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div className="oa-field" style={{ gridColumn: "1 / -1" }}>
        <label className="oa-label" htmlFor="pf-crm">
          CRM (opcional)
        </label>
        <input
          id="pf-crm"
          className="oa-input"
          value={form.crm}
          maxLength={64}
          placeholder="Ex.: CRM-SP 123456"
          onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))}
        />
      </div>
      <div className="oa-field" style={{ gridColumn: "1 / -1" }}>
        <label className="oa-label" htmlFor="pf-cep-lookup">
          CEP (opcional — ViaCEP)
        </label>
        <input
          id="pf-cep-lookup"
          className="oa-input"
          value={cepLookup}
          inputMode="numeric"
          placeholder="Somente para buscar cidade e bairro"
          maxLength={9}
          autoComplete="off"
          onChange={(e) => setCepLookup(e.target.value)}
        />
        <span className="oa-muted" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
          Com 8 dígitos preenchemos cidade (e UF) e bairro; não é salvo no cadastro do profissional.
        </span>
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="pf-city">
          Cidade
        </label>
        <input
          id="pf-city"
          className="oa-input"
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          required
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="pf-neighborhood">
          Bairro
        </label>
        <input
          id="pf-neighborhood"
          className="oa-input"
          value={form.neighborhood}
          onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
        />
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="pf-clinic">
          Clínica (opcional)
        </label>
        <select
          id="pf-clinic"
          className="oa-select"
          value={form.clinicId}
          onChange={(e) => setForm((p) => ({ ...p, clinicId: e.target.value }))}
        >
          <option value="">Nenhuma</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.city}
            </option>
          ))}
        </select>
      </div>
      <div className="oa-field">
        <label className="oa-label" htmlFor="pf-rating">
          Nota (0–5)
        </label>
        <input
          id="pf-rating"
          className="oa-input"
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={form.rating}
          onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
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

export default function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([]);
  const [listMeta, setListMeta] = useState<ProfessionalsPageResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [minRatingInput, setMinRatingInput] = useState("");
  const [maxRatingInput, setMaxRatingInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [debouncedMinRating, setDebouncedMinRating] = useState("");
  const [debouncedMaxRating, setDebouncedMaxRating] = useState("");
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [specialties, setSpecialties] = useState<CatalogItem[]>([]);
  const [insurances, setInsurances] = useState<CatalogItem[]>([]);
  const [createForm, setCreateForm] = useState<ProfForm>(() => emptyForm());
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [editForm, setEditForm] = useState<ProfForm>(() => emptyForm());
  const [error, setError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setDebouncedMinRating(minRatingInput.trim());
      setDebouncedMaxRating(maxRatingInput.trim());
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput, minRatingInput, maxRatingInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, debouncedMinRating, debouncedMaxRating]);

  const loadCatalogs = useCallback(async () => {
    const [clinicRes, specList, insList] = await Promise.all([
      apiRequest<{ items: ClinicOption[] }>("/admin/clinics?limit=500&page=1"),
      apiRequest<CatalogItem[]>("/admin/specialties"),
      apiRequest<CatalogItem[]>("/admin/insurances")
    ]);
    setClinics(clinicRes.items.map((c) => ({ id: c.id, name: c.name, city: c.city })));
    setSpecialties(specList);
    setInsurances(insList);
  }, []);

  const loadProfessionals = useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedQ) q.set("q", debouncedQ);
    if (debouncedMinRating !== "") {
      const n = Number(debouncedMinRating.replace(",", "."));
      if (Number.isFinite(n)) q.set("minRating", String(n));
    }
    if (debouncedMaxRating !== "") {
      const n = Number(debouncedMaxRating.replace(",", "."));
      if (Number.isFinite(n)) q.set("maxRating", String(n));
    }
    const res = await apiRequest<ProfessionalsPageResponse>(`/admin/professionals?${q.toString()}`);
    setItems(res.items);
    setListMeta(res);
  }, [page, limit, debouncedQ, debouncedMinRating, debouncedMaxRating]);

  useEffect(() => {
    void loadCatalogs().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [loadCatalogs]);

  useEffect(() => {
    void loadProfessionals().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [loadProfessionals]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/admin/professionals", {
        method: "POST",
        body: JSON.stringify(formToPayload(createForm))
      });
      setCreateForm(emptyForm());
      await loadProfessionals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar.");
    }
  }

  function openEdit(p: Professional) {
    setEditing(p);
    setEditForm(profToForm(p));
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await apiRequest(`/admin/professionals/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(formToPayload(editForm))
      });
      setEditOpen(false);
      setEditing(null);
      await loadProfessionals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir este profissional?")) return;
    setError("");
    try {
      await apiRequest(`/admin/professionals/${id}`, { method: "DELETE" });
      await loadProfessionals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  return (
    <AdminLayout
      title="Profissionais"
      description="Vincule especialidades, convênios e opcionalmente uma clínica. Edição completa sem prompts."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-card" style={{ marginBottom: 24 }}>
        <h2 className="oa-card__title">Novo profissional</h2>
        <form onSubmit={(e) => void create(e)}>
          <ProfFormFields
            form={createForm}
            setForm={setCreateForm}
            clinics={clinics}
            specialties={specialties}
            insurances={insurances}
          />
          <div className="oa-form-actions">
            <button type="submit" className="oa-btn oa-btn--primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="oa-filters-row">
        <AdminSearchField
          label="Nome, cidade, bairro ou clínica"
          placeholder="Ex.: fonoaudiologia, Campinas…"
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v);
            setError("");
          }}
        />
        <div className="oa-field oa-field--narrow">
          <label className="oa-label" htmlFor="prof-min-rating">
            Nota mín.
          </label>
          <input
            id="prof-min-rating"
            className="oa-input"
            type="number"
            step="0.1"
            min={0}
            max={5}
            placeholder="—"
            value={minRatingInput}
            onChange={(e) => setMinRatingInput(e.target.value)}
          />
        </div>
        <div className="oa-field oa-field--narrow">
          <label className="oa-label" htmlFor="prof-max-rating">
            Nota máx.
          </label>
          <input
            id="prof-max-rating"
            className="oa-input"
            type="number"
            step="0.1"
            min={0}
            max={5}
            placeholder="—"
            value={maxRatingInput}
            onChange={(e) => setMaxRatingInput(e.target.value)}
          />
        </div>
      </div>

      <div className="oa-table-wrap">
        <table className="oa-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cidade / Clínica</th>
              <th>Nota</th>
              <th style={{ width: 200 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  {p.crm ? (
                    <div className="oa-muted" style={{ marginTop: 2, fontSize: 12 }}>
                      CRM {p.crm}
                    </div>
                  ) : null}
                  <div className="oa-muted" style={{ marginTop: 4 }}>
                    {p.specialties?.length ? `${p.specialties.length} esp.` : "Sem esp."}
                    {p.insurances?.length ? ` · ${p.insurances.length} conv.` : ""}
                  </div>
                </td>
                <td>
                  {p.city}
                  {p.clinic ? (
                    <div className="oa-muted" style={{ marginTop: 4 }}>
                      {p.clinic.name}
                    </div>
                  ) : null}
                </td>
                <td>{Number(p.rating).toFixed(1)}</td>
                <td>
                  <div className="oa-table__actions">
                    <button type="button" className="oa-btn oa-btn--secondary oa-btn--sm" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button type="button" className="oa-btn oa-btn--danger oa-btn--sm" onClick={() => void remove(p.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {listMeta ? (
        <AdminPagination
          page={listMeta.page}
          totalPages={listMeta.totalPages}
          total={listMeta.total}
          limit={listMeta.limit}
          entityLabel="profissionais"
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onLimitChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />
      ) : null}

      <Modal
        open={editOpen}
        title="Editar profissional"
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
              Salvar
            </button>
          </>
        }
      >
        <ProfFormFields form={editForm} setForm={setEditForm} clinics={clinics} specialties={specialties} insurances={insurances} />
      </Modal>
    </AdminLayout>
  );
}
