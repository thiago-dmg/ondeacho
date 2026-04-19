import type { ClinicListing, ClinicProfessionalSummary, PublicReview } from "./types";

export function parseClinicProfessionalSummary(raw: Record<string, unknown>): ClinicProfessionalSummary {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "")
  };
}

export function parseClinic(raw: Record<string, unknown>): ClinicListing {
  const professionalsRaw = raw.professionals;
  const professionals = Array.isArray(professionalsRaw)
    ? professionalsRaw
        .filter((p): p is Record<string, unknown> => p !== null && typeof p === "object")
        .map(parseClinicProfessionalSummary)
    : [];

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    city: String(raw.city ?? ""),
    neighborhood: raw.neighborhood != null ? String(raw.neighborhood) : null,
    addressLine: raw.addressLine != null ? String(raw.addressLine) : null,
    addressNumber: raw.addressNumber != null ? String(raw.addressNumber) : null,
    zipcode: raw.zipcode != null ? String(raw.zipcode) : null,
    phone: raw.phone != null ? String(raw.phone) : null,
    whatsappPhone: raw.whatsappPhone != null ? String(raw.whatsappPhone) : null,
    addedByCommunity: raw.addedByCommunity === true,
    isClaimed: raw.isClaimed === true,
    isVerified: raw.isVerified === true,
    viewerIsOwner: raw.viewerIsOwner === true,
    rating: Number(raw.rating ?? 0) || 0,
    displayRating:
      raw.displayRating != null && raw.displayRating !== ""
        ? Number(raw.displayRating)
        : null,
    displayReviewCount: Number(raw.displayReviewCount ?? 0) || 0,
    description: raw.description != null ? String(raw.description) : null,
    professionals
  };
}

export function parseReview(raw: Record<string, unknown>): PublicReview {
  return {
    id: String(raw.id ?? ""),
    rating: Number(raw.rating ?? 0) || 0,
    comment: String(raw.comment ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    authorName: String(raw.authorName ?? "Usuário")
  };
}
