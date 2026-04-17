import { useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
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
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  async function load() {
    const data = await apiRequest<Suggestion[]>("/admin/clinic-suggestions?status=PENDENTE");
    setItems(data);
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, []);

  async function approve(id: string) {
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

  return (
    <AdminLayout
      title="Sugestões da comunidade"
      description="Cadastros sugeridos por usuários. Aprovar cria o registro; rejeitar pode incluir motivo interno."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <p style={{ marginTop: 0, marginBottom: 16 }}>
        <span className="oa-badge oa-badge--pending">Pendentes: {items.length}</span>
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
              {item.phone ? ` · ${item.phone}` : ""}
            </p>
            <p style={{ margin: "0 0 8px" }}>
              Sugerido por <strong>{item.suggestedByName}</strong>
            </p>
            <p className="oa-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              {new Date(item.createdAt).toLocaleString("pt-BR")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <button type="button" className="oa-btn oa-btn--primary oa-btn--sm" onClick={() => void approve(item.id)}>
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
