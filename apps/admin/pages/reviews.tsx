import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "../src/components/AdminLayout";
import { AdminPagination } from "../src/components/AdminPagination";
import { AdminSearchField } from "../src/components/AdminSearchField";
import { apiRequest } from "../src/services/api";

type Review = {
  id: string;
  clinicId: string;
  clinicName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
};

type Filter = "all" | Review["status"];

type PageData = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function statusBadge(status: Review["status"]) {
  switch (status) {
    case "pending":
      return <span className="oa-badge oa-badge--pending">Pendente</span>;
    case "approved":
      return <span className="oa-badge oa-badge--ok">Aprovada</span>;
    case "rejected":
      return <span className="oa-badge oa-badge--no">Rejeitada</span>;
    default:
      return <span className="oa-badge oa-badge--muted">{status}</span>;
  }
}

export default function ReviewsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [filter, debouncedQ]);

  const load = useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), limit: "12" });
    if (debouncedQ) q.set("q", debouncedQ);
    if (filter !== "all") q.set("status", filter);
    const res = await apiRequest<PageData>(`/admin/reviews?${q.toString()}`);
    setData(res);
  }, [page, filter, debouncedQ]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."));
  }, [load]);

  async function moderate(id: string, status: "approved" | "rejected") {
    setError("");
    try {
      await apiRequest(`/admin/reviews/${id}/moderate`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao moderar.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir esta avaliação permanentemente?")) return;
    setError("");
    try {
      await apiRequest(`/admin/reviews/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "pending", label: "Pendentes" },
    { id: "approved", label: "Aprovadas" },
    { id: "rejected", label: "Rejeitadas" }
  ];

  const items = data?.items ?? [];

  return (
    <AdminLayout
      title="Avaliações"
      description="Aprove ou rejeite comentários da comunidade. Exclusão remove o registro do banco."
    >
      {error ? <p className="oa-error">{error}</p> : null}

      <div className="oa-toolbar">
        <AdminSearchField
          label="Buscar"
          placeholder="Nome da clínica ou texto do comentário…"
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v);
            setError("");
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`oa-btn oa-btn--sm ${filter === f.id ? "oa-btn--primary" : "oa-btn--ghost"}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="oa-list-stack">
        {items.map((item) => (
          <article key={item.id} className="oa-card oa-review-card">
            <div className="oa-review-card__meta">
              <strong>Nota {item.rating}</strong>
              {statusBadge(item.status)}
              <span className="oa-muted">{item.clinicName}</span>
            </div>
            <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>{item.comment || <em className="oa-muted">Sem texto</em>}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {item.status === "pending" ? (
                <>
                  <button type="button" className="oa-btn oa-btn--primary oa-btn--sm" onClick={() => void moderate(item.id, "approved")}>
                    Aprovar
                  </button>
                  <button type="button" className="oa-btn oa-btn--secondary oa-btn--sm" onClick={() => void moderate(item.id, "rejected")}>
                    Rejeitar
                  </button>
                </>
              ) : null}
              <button type="button" className="oa-btn oa-btn--danger oa-btn--sm" onClick={() => void remove(item.id)}>
                Excluir
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="oa-muted">Nenhuma avaliação neste filtro.</p> : null}
      </div>

      {data ? (
        <AdminPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          entityLabel="avaliações"
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
    </AdminLayout>
  );
}
