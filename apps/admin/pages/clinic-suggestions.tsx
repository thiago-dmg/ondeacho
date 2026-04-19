import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type Suggestion = {
  id: string;
  name: string;
  targetType: "clinica" | "profissional";
  city: string;
  neighborhood?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  professionalCrm?: string | null;
  linkedClinicId?: string | null;
  linkedClinicName?: string | null;
  specialtyIds?: string[];
  specialtyOther?: string | null;
  insuranceIds?: string[];
  insuranceOther?: string | null;
  specialtyNames?: string[];
  insuranceNames?: string[];
  observations?: string | null;
  suggestedByName: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  createdAt: string;
};

type AdminClinicRow = { id: string; name: string; city: string };
type ClinicsListResponse = { items: AdminClinicRow[] };

type ProfResolution = "existing" | "create";

export default function ClinicSuggestionsPage() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const [approveProf, setApproveProf] = useState<Suggestion | null>(null);
  const [profResolution, setProfResolution] = useState<ProfResolution>("existing");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [draftClinicName, setDraftClinicName] = useState("");
  const [draftClinicCity, setDraftClinicCity] = useState("");
  const [clinicOptions, setClinicOptions] = useState<AdminClinicRow[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const load = useCallback(async () => {
    const data = await apiRequest<Suggestion[]>("/admin/clinic-suggestions?status=PENDENTE");
    setItems(data);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [load]);

  const loadClinicOptions = useCallback(async () => {
    setClinicsLoading(true);
    try {
      const res = await apiRequest<ClinicsListResponse>("/admin/clinics?page=1&limit=100");
      setClinicOptions(
        (res.items ?? []).map((c) => ({
          id: String(c.id),
          name: String(c.name ?? ""),
          city: String(c.city ?? "")
        }))
      );
    } finally {
      setClinicsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!approveProf) return;
    void loadClinicOptions();
    if (approveProf.linkedClinicId) {
      setProfResolution("existing");
      setSelectedClinicId(approveProf.linkedClinicId);
      setDraftClinicName(approveProf.linkedClinicName ?? "");
      setDraftClinicCity(approveProf.city ?? "");
    } else if (approveProf.linkedClinicName) {
      setProfResolution("create");
      setSelectedClinicId("");
      setDraftClinicName(approveProf.linkedClinicName);
      setDraftClinicCity(approveProf.city ?? "");
    } else {
      setProfResolution("existing");
      setSelectedClinicId("");
      setDraftClinicName("");
      setDraftClinicCity(approveProf.city ?? "");
    }
  }, [approveProf, loadClinicOptions]);

  async function approveClinicSuggestion(id: string) {
    setError("");
    try {
      await apiRequest(`/admin/clinic-suggestions/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({})
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao aprovar.");
    }
  }

  function openApprove(item: Suggestion) {
    setError("");
    if (item.targetType === "clinica") {
      void approveClinicSuggestion(item.id);
      return;
    }
    setApproveProf(item);
  }

  async function confirmApproveProfessional() {
    if (!approveProf) return;
    setError("");
    if (profResolution === "existing") {
      if (!selectedClinicId) {
        setError("Selecione uma clínica existente ou escolha criar nova.");
        return;
      }
    } else {
      if (!draftClinicName.trim()) {
        setError("Informe o nome da nova clínica.");
        return;
      }
      if (!draftClinicCity.trim()) {
        setError("Informe a cidade da nova clínica.");
        return;
      }
    }

    setApproveSubmitting(true);
    try {
      const body: Record<string, unknown> = {};
      if (profResolution === "existing") {
        body.professionalClinicId = selectedClinicId;
      } else {
        body.createNewClinicFromDraft = true;
        body.draftClinicName = draftClinicName.trim();
        body.draftClinicCity = draftClinicCity.trim();
      }
      await apiRequest(`/admin/clinic-suggestions/${approveProf.id}/approve`, {
        method: "PATCH",
        body: JSON.stringify(body)
      });
      setApproveProf(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao aprovar.");
    } finally {
      setApproveSubmitting(false);
    }
  }

  async function confirmReject() {
    if (!rejectId) return;
    setError("");
    try {
      await apiRequest(`/admin/clinic-suggestions/${rejectId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ note: rejectNote.trim() })
      });
      setRejectId(null);
      setRejectNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao rejeitar.");
    }
  }

  const hasLinkedClinicFromUser = Boolean(approveProf?.linkedClinicId);

  return (
    <AdminLayout
      title="Sugestões da comunidade"
      description="Cadastros sugeridos por usuários. Aprovar cria o registro; rejeitar pode incluir motivo interno."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <p style={{ marginTop: 0, marginBottom: 16 }}>
        <span className="oa-badge oa-badge--pending">Pendentes: {items.length}</span>
      </p>

      <p className="oa-muted" style={{ marginBottom: 20, fontSize: "0.92rem" }}>
        <strong>Profissional:</strong> na aprovação é obrigatório vincular a uma clínica existente ou criar uma nova a
        partir do rascunho (inclui o caso «Outros» no site público). Não há profissional sem <code>clinicId</code>.
      </p>

      <div className="oa-list-stack">
        {items.map((item) => (
          <article key={item.id} className="oa-card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: "1.05rem" }}>{item.name}</strong>
              <span className="oa-badge oa-badge--muted">{item.targetType === "clinica" ? "Clínica" : "Profissional"}</span>
            </div>
            <p className="oa-muted" style={{ margin: "0 0 8px" }}>
              {item.city}
              {item.neighborhood ? ` · ${item.neighborhood}` : ""}
              {item.phone ? ` · ${item.phone}` : ""}
              {item.whatsappPhone ? ` · WhatsApp ${item.whatsappPhone}` : ""}
            </p>
            {item.targetType === "profissional" ? (
              <div className="oa-muted" style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
                {item.linkedClinicId ? (
                  <p style={{ margin: "0 0 4px" }}>Clínica escolhida na sugestão (ID): {item.linkedClinicId}</p>
                ) : null}
                {item.linkedClinicName ? (
                  <p style={{ margin: "0 0 4px" }}>Clínica «Outros» (rascunho): {item.linkedClinicName}</p>
                ) : !item.linkedClinicId ? (
                  <p style={{ margin: "0 0 4px" }}>Sem clínica na sugestão — o admin deve definir na aprovação.</p>
                ) : null}
                {item.professionalCrm ? <p style={{ margin: "0 0 4px" }}>CRM / registro: {item.professionalCrm}</p> : null}
                {item.addressLine ? <p style={{ margin: 0 }}>Endereço: {item.addressLine}</p> : null}
              </div>
            ) : item.addressLine ? (
              <p className="oa-muted" style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
                Endereço: {item.addressLine}
              </p>
            ) : null}
            {item.specialtyIds && item.specialtyIds.length > 0 ? (
              <p className="oa-muted" style={{ margin: "0 0 2px", fontSize: "0.85rem" }}>
                Especialidades (IDs): {item.specialtyIds.length}
              </p>
            ) : null}
            {item.specialtyOther ? (
              <p className="oa-muted" style={{ margin: "0 0 4px", fontSize: "0.85rem" }}>
                Especialidades (outros): {item.specialtyOther}
              </p>
            ) : null}
            {item.specialtyNames && item.specialtyNames.length > 0 ? (
              <p className="oa-muted" style={{ margin: "0 0 4px", fontSize: "0.88rem" }}>
                Especialidades (nomes): {item.specialtyNames.join(", ")}
              </p>
            ) : null}
            {item.insuranceIds && item.insuranceIds.length > 0 ? (
              <p className="oa-muted" style={{ margin: "0 0 2px", fontSize: "0.85rem" }}>
                Convênios (IDs): {item.insuranceIds.length}
              </p>
            ) : null}
            {item.insuranceOther ? (
              <p className="oa-muted" style={{ margin: "0 0 4px", fontSize: "0.85rem" }}>
                Convênios (outros): {item.insuranceOther}
              </p>
            ) : null}
            {item.insuranceNames && item.insuranceNames.length > 0 ? (
              <p className="oa-muted" style={{ margin: "0 0 8px", fontSize: "0.88rem" }}>
                Convênios (nomes): {item.insuranceNames.join(", ")}
              </p>
            ) : null}
            {item.observations ? (
              <p className="oa-muted" style={{ margin: "0 0 8px", fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>
                Obs.: {item.observations}
              </p>
            ) : null}
            <p style={{ margin: "0 0 8px" }}>
              Sugerido por <strong>{item.suggestedByName}</strong>
            </p>
            <p className="oa-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              {new Date(item.createdAt).toLocaleString("pt-BR")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <button type="button" className="oa-btn oa-btn--primary oa-btn--sm" onClick={() => openApprove(item)}>
                Aprovar
              </button>
              <button
                type="button"
                className="oa-btn oa-btn--secondary oa-btn--sm"
                onClick={() => {
                  setRejectId(item.id);
                  setRejectNote("");
                }}
              >
                Rejeitar…
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="oa-muted">Nenhuma sugestão pendente.</p> : null}
      </div>

      <Modal
        open={Boolean(approveProf)}
        title="Aprovar sugestão de profissional"
        onClose={() => {
          if (!approveSubmitting) setApproveProf(null);
        }}
        footer={
          <>
            <button type="button" className="oa-btn oa-btn--ghost" disabled={approveSubmitting} onClick={() => setApproveProf(null)}>
              Cancelar
            </button>
            <button type="button" className="oa-btn oa-btn--primary" disabled={approveSubmitting} onClick={() => void confirmApproveProfessional()}>
              {approveSubmitting ? "Aprovando…" : "Confirmar aprovação"}
            </button>
          </>
        }
      >
        {approveProf ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="oa-muted" style={{ marginTop: 0 }}>
              Profissional: <strong>{approveProf.name}</strong> — {approveProf.city}
            </p>
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className="oa-label">Clínica após aprovação</legend>
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  type="radio"
                  name="profRes"
                  checked={profResolution === "existing"}
                  disabled={approveSubmitting}
                  onChange={() => setProfResolution("existing")}
                />
                <span>Vincular a clínica já cadastrada</span>
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="radio"
                  name="profRes"
                  checked={profResolution === "create"}
                  disabled={approveSubmitting || hasLinkedClinicFromUser}
                  onChange={() => setProfResolution("create")}
                />
                <span>Criar nova clínica (rascunho / «Outros»)</span>
              </label>
              {hasLinkedClinicFromUser ? (
                <p className="oa-muted" style={{ fontSize: "0.85rem", marginTop: 8 }}>
                  A sugestão já referencia uma clínica existente; criação automática de outra clínica não está disponível
                  neste caso.
                </p>
              ) : null}
            </fieldset>

            {profResolution === "existing" ? (
              <div className="oa-field">
                <label className="oa-label" htmlFor="approve-clinic-select">
                  Clínica
                </label>
                {clinicsLoading ? (
                  <p className="oa-muted">A carregar clínicas…</p>
                ) : (
                  <select
                    id="approve-clinic-select"
                    className="oa-input"
                    value={selectedClinicId}
                    disabled={approveSubmitting}
                    onChange={(e) => setSelectedClinicId(e.target.value)}
                  >
                    <option value="">— Selecione —</option>
                    {clinicOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <>
                <div className="oa-field">
                  <label className="oa-label" htmlFor="draft-name">
                    Nome da nova clínica
                  </label>
                  <input
                    id="draft-name"
                    className="oa-input"
                    value={draftClinicName}
                    disabled={approveSubmitting}
                    onChange={(e) => setDraftClinicName(e.target.value)}
                  />
                </div>
                <div className="oa-field">
                  <label className="oa-label" htmlFor="draft-city">
                    Cidade
                  </label>
                  <input
                    id="draft-city"
                    className="oa-input"
                    value={draftClinicCity}
                    disabled={approveSubmitting}
                    onChange={(e) => setDraftClinicCity(e.target.value)}
                  />
                </div>
                <p className="oa-muted" style={{ fontSize: "0.85rem" }}>
                  Endereço, telefone e especialidades/convênios da sugestão serão copiados para a nova clínica quando
                  existirem.
                </p>
              </>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(rejectId)}
        title="Rejeitar sugestão"
        onClose={() => {
          setRejectId(null);
          setRejectNote("");
        }}
        footer={
          <>
            <button type="button" className="oa-btn oa-btn--ghost" onClick={() => setRejectId(null)}>
              Cancelar
            </button>
            <button type="button" className="oa-btn oa-btn--primary" onClick={() => void confirmReject()}>
              Confirmar rejeição
            </button>
          </>
        }
      >
        <div className="oa-field">
          <label className="oa-label" htmlFor="rej-note-sug">
            Motivo (opcional)
          </label>
          <textarea
            id="rej-note-sug"
            className="oa-textarea"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Será armazenado para auditoria interna."
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}
