import { useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type Claim = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  clinicId?: string | null;
  professionalId?: string | null;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  createdAt: string;
};

export default function ProfileClaimsPage() {
  const [items, setItems] = useState<Claim[]>([]);
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  async function load() {
    const data = await apiRequest<Claim[]>("/admin/profile-claims?status=PENDENTE");
    setItems(data);
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, []);

  async function approve(id: string) {
    setError("");
    try {
      await apiRequest(`/admin/profile-claims/${id}/approve`, {
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
      await apiRequest(`/admin/profile-claims/${rejectId}/reject`, {
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
      title="Reivindicações de perfil"
      description="Solicitações para gerenciar fichas de clínicas ou profissionais no app."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <p style={{ marginTop: 0, marginBottom: 16 }}>
        <span className="oa-badge oa-badge--pending">Pendentes: {items.length}</span>
      </p>

      <div className="oa-list-stack">
        {items.map((item) => (
          <article key={item.id} className="oa-card">
            <div style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: "1.05rem" }}>{item.requesterName}</strong>
            </div>
            <p style={{ margin: "0 0 6px" }}>{item.requesterEmail}</p>
            <p className="oa-muted" style={{ margin: "0 0 8px" }}>
              Tel: {item.requesterPhone}
            </p>
            <p style={{ margin: "0 0 8px" }}>
              Perfil alvo:{" "}
              {item.clinicId ? (
                <>
                  Clínica <code style={{ fontSize: "0.85em" }}>{item.clinicId}</code>
                </>
              ) : (
                <>
                  Profissional <code style={{ fontSize: "0.85em" }}>{item.professionalId}</code>
                </>
              )}
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
        {items.length === 0 ? <p className="oa-muted">Nenhuma reivindicação pendente.</p> : null}
      </div>

      <Modal
        open={Boolean(rejectId)}
        title="Rejeitar reivindicação"
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
          <label className="oa-label" htmlFor="rej-note-claim">
            Motivo (opcional)
          </label>
          <textarea
            id="rej-note-claim"
            className="oa-textarea"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}
