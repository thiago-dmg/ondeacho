import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type Specialty = { id: string; slug: string; name: string };

export default function SpecialtiesPage() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setItems(await apiRequest<Specialty[]>("/admin/specialties"));
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/admin/specialties", {
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

  function openEdit(item: Specialty) {
    setEditing(item);
    setEditSlug(item.slug);
    setEditName(item.name);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await apiRequest(`/admin/specialties/${editing.id}`, {
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
    if (!window.confirm("Excluir esta especialidade?")) return;
    setError("");
    try {
      await apiRequest(`/admin/specialties/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  return (
    <AdminLayout title="Especialidades" description="Slug único para URLs internas; nome exibido no app.">
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-card" style={{ marginBottom: 24 }}>
        <h2 className="oa-card__title">Nova especialidade</h2>
        <form onSubmit={(e) => void create(e)}>
          <div className="oa-form-grid" style={{ maxWidth: 640 }}>
            <div className="oa-field">
              <label className="oa-label" htmlFor="spec-slug">
                Slug
              </label>
              <input
                id="spec-slug"
                className="oa-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex.: psicologia-infantil"
                required
              />
            </div>
            <div className="oa-field">
              <label className="oa-label" htmlFor="spec-name">
                Nome
              </label>
              <input
                id="spec-name"
                className="oa-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome legível"
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
        title="Editar especialidade"
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
            <label className="oa-label" htmlFor="edit-spec-slug">
              Slug
            </label>
            <input
              id="edit-spec-slug"
              className="oa-input"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              required
            />
          </div>
          <div className="oa-field">
            <label className="oa-label" htmlFor="edit-spec-name">
              Nome
            </label>
            <input id="edit-spec-name" className="oa-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
