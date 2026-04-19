type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
};

export function AdminSearchField({ value, onChange, placeholder = "Buscar…", label = "Busca" }: Props) {
  return (
    <div className="oa-field" style={{ flex: "1 1 220px", maxWidth: 360 }}>
      <label className="oa-label" htmlFor="oa-admin-search">
        {label}
      </label>
      <input
        id="oa-admin-search"
        className="oa-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
