type Props = {
  value: number;
  max?: number;
  size?: "sm" | "md";
};

export function StarRating({ value, max = 5, size = "md" }: Props) {
  const clamped = Math.min(max, Math.max(0, value));
  const full = Math.round(clamped);
  const fontSize = size === "sm" ? 14 : 18;
  const stars = [...Array(full).fill("★"), ...Array(max - full).fill("☆")];
  return (
    <span
      style={{
        color: "var(--color-star)",
        fontSize,
        letterSpacing: 1,
        lineHeight: 1
      }}
      aria-label={`Nota ${value.toFixed(1)} de ${max}`}
    >
      {stars.join("")}
    </span>
  );
}
