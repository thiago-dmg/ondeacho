type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  entityLabel?: string;
};

export function AdminPagination({ page, totalPages, total, onPageChange, entityLabel = "registros" }: Props) {
  if (totalPages <= 1 && total === 0) {
    return null;
  }
  return (
    <div className="oa-pagination">
      <span className="oa-pagination__meta">
        {total} {entityLabel}
        {totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}
      </span>
      {totalPages > 1 ? (
        <div className="oa-pagination__btns">
          <button
            type="button"
            className="oa-btn oa-btn--ghost oa-btn--sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="oa-btn oa-btn--ghost oa-btn--sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
