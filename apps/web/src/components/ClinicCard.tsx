import Link from "next/link";
import type { ClinicListing } from "../lib/types";
import { StarRating } from "./StarRating";

type Props = {
  clinic: ClinicListing;
};

export function ClinicCard({ clinic }: Props) {
  const rating = clinic.displayRating ?? clinic.rating;
  const hasRating = rating > 0 && (clinic.displayReviewCount ?? 0) > 0;
  const location = [clinic.neighborhood, clinic.city].filter(Boolean).join(" · ");

  return (
    <article className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{clinic.name}</h2>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
            {location || clinic.city}
          </p>
        </div>
        {clinic.isVerified ? (
          <span className="badge badge-green">Verificada</span>
        ) : (
          <span className="badge">Comunidade</span>
        )}
      </div>
      {hasRating ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRating value={rating} />
          <span className="muted" style={{ fontSize: 14 }}>
            {rating.toFixed(1)} · {clinic.displayReviewCount} aval.
          </span>
        </div>
      ) : (
        <span className="muted" style={{ fontSize: 14 }}>
          Sem avaliações ainda na comunidade
        </span>
      )}
      <div style={{ marginTop: "auto", paddingTop: 8 }}>
        <Link
          href={`/clinica/${clinic.id}`}
          className="btn-primary"
          style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
