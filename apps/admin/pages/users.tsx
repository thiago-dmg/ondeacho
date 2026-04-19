import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { AdminPagination } from "../src/components/AdminPagination";
import { AdminSearchField } from "../src/components/AdminSearchField";
import { Modal } from "../src/components/Modal";
import { apiRequest } from "../src/services/api";

type Role = "admin" | "responsavel" | "clinica" | "owner";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ROLES: { id: Role; label: string }[] = [
  { id: "responsavel", label: "Responsável" },
  { id: "clinica", label: "Clínica" },
  { id: "owner", label: "Proprietário" },
  { id: "admin", label: "Admin" }
];

export default function UsersPage() {
  const [data, setData] = useState<Paginated<UserRow> | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<Role>("responsavel");
  const [formPassword, setFormPassword] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const load = useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), limit: "15" });
    if (debouncedQ) q.set("q", debouncedQ);
    const res = await apiRequest<Paginated<UserRow>>(`/admin/users?${q.toString()}`);
    setData(res);
  }, [page, debouncedQ]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [load]);

  function openEdit(u: UserRow) {
    setEditing(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormPassword("");
    setEditOpen(true);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    try {
      const body: Record<string, string> = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole
      };
      if (formPassword.trim().length >= 8) {
        body.password = formPassword.trim();
      }
      await apiRequest(`/admin/users/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(body)
      });
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) return;
    setError("");
    try {
      await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir.");
    }
  }

  const items = data?.items ?? [];

  return (
    <AdminLayout
      title="Usuários"
      description="Edite dados, redefina senha ou remova contas. Não é possível excluir o único administrador."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-toolbar">
        <AdminSearchField
          label="Buscar por nome ou e-mail"
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v);
            setError("");
          }}
          placeholder="Nome ou e-mail…"
        />
      </div>

      <div className="oa-table-wrap">
        <table className="oa-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th style={{ width: 180 }} aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="oa-badge oa-badge--muted">{u.role}</span>
                </td>
                <td>
                  <div className="oa-table__actions">
                    <button type="button" className="oa-btn oa-btn--secondary oa-btn--sm" onClick={() => openEdit(u)}>
                      Editar
                    </button>
                    <button type="button" className="oa-btn oa-btn--danger oa-btn--sm" onClick={() => void removeUser(u.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data ? (
        <AdminPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          entityLabel="usuários"
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}

      <Modal
        open={editOpen}
        title="Editar usuário"
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        footer={
          <>
            <button type="button" className="oa-btn oa-btn--ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
            <button type="submit" form="edit-user-form" className="oa-btn oa-btn--primary">
              Salvar
            </button>
          </>
        }
      >
        <form id="edit-user-form" onSubmit={(e) => void saveEdit(e)}>
          <div className="oa-form-grid oa-form-grid--2">
            <div className="oa-field">
              <label className="oa-label" htmlFor="u-name">
                Nome
              </label>
              <input id="u-name" className="oa-input" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="oa-field">
              <label className="oa-label" htmlFor="u-email">
                E-mail
              </label>
              <input id="u-email" className="oa-input" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
            </div>
            <div className="oa-field">
              <label className="oa-label" htmlFor="u-role">
                Papel
              </label>
              <select id="u-role" className="oa-select" value={formRole} onChange={(e) => setFormRole(e.target.value as Role)}>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="oa-field">
              <label className="oa-label" htmlFor="u-pass">
                Nova senha (opcional)
              </label>
              <input
                id="u-pass"
                className="oa-input"
                type="password"
                autoComplete="new-password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mín. 8 caracteres, vazio = não alterar"
                minLength={8}
              />
            </div>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
