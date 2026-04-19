const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;

type Props = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange?: (n: number) => void;
  pageSizeOptions?: readonly number[];
  entityLabel?: string;
};

export function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  entityLabel = "registros"
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="oa-pagination">
      <div className="oa-pagination__left">
        <span className="oa-pagination__meta">
          {total === 0
            ? `0 ${entityLabel}`
            : `${from}–${to} de ${total} ${entityLabel} · página ${page}/${totalPages}`}
        </span>
        {onLimitChange ? (
          <label className="oa-pagination__limit">
            <span>Por página</span>
            <select
              className="oa-select oa-select--inline"
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
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
    </div>
  );
}
