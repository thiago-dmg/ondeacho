import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type Insurance = { id: string; slug: string; name: string };

export default function InsurancesPage() {
  const [items, setItems] = useState<Insurance[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setItems(await apiRequest<Insurance[]>("/admin/insurances"));
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/admin/insurances", {
        method: "POST",
        body: JSON.stringify({ slug: slug.trim(), name: name.trim() })
      });
      setSlug("");
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar.");
    }
  }

  function openEdit(item: Insurance) {
    setEditing(item);
    setEditSlug(item.slug);
    setEditName(item.name);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await apiRequest(`/admin/insurances/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ slug: editSlug.trim(), name: editName.trim() })
      });
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir este convênio?")) return;
    setError("");
    try {
      await apiRequest(`/admin/insurances/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  return (
    <AdminLayout title="Convênios" description="Planos aceitos pelas clínicas; slug para integrações e filtros.">
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-card" style={{ marginBottom: 24 }}>
        <h2 className="oa-card__title">Novo convênio</h2>
        <form onSubmit={(e) => void create(e)}>
          <div className="oa-form-grid" style={{ maxWidth: 640 }}>
            <div className="oa-field">
              <label className="oa-label" htmlFor="ins-slug">
                Slug
              </label>
              <input
                id="ins-slug"
                className="oa-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex.: unimed"
                required
              />
            </div>
            <div className="oa-field">
              <label className="oa-label" htmlFor="ins-name">
                Nome
              </label>
              <input
                id="ins-name"
                className="oa-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="oa-form-actions">
            <button type="submit" className="oa-btn oa-btn--primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>

      <div className="oa-table-wrap">
        <table className="oa-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th style={{ width: 200 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>
                  <code style={{ fontSize: "0.85em", color: "var(--oa-muted)" }}>{item.slug}</code>
                </td>
                <td>
                  <div className="oa-table__actions">
                    <button type="button" className="oa-btn oa-btn--secondary oa-btn--sm" onClick={() => openEdit(item)}>
                      Editar
                    </button>
                    <button type="button" className="oa-btn oa-btn--danger oa-btn--sm" onClick={() => void remove(item.id)}>
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
        title="Editar convênio"
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
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
        <div className="oa-form-grid oa-form-grid--2">
          <div className="oa-field">
            <label className="oa-label" htmlFor="edit-ins-slug">
              Slug
            </label>
            <input id="edit-ins-slug" className="oa-input" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required />
          </div>
          <div className="oa-field">
            <label className="oa-label" htmlFor="edit-ins-name">
              Nome
            </label>
            <input id="edit-ins-name" className="oa-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
