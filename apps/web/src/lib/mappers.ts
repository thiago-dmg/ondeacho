import type { ClinicListing, ClinicProfessionalSummary, PublicReview } from "./types";

function parseTruthyFlag(raw: Record<string, unknown>, camelKey: string, snakeKey: string): boolean {
  const v = raw[camelKey] ?? raw[snakeKey];
  if (v === true || v === 1) {
    return true;
  }
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

export function parseClinicProfessionalSummary(raw: Record<string, unknown>): ClinicProfessionalSummary {
  const crmRaw = raw.crm != null ? String(raw.crm).trim() : "";
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    crm: crmRaw.length > 0 ? crmRaw : null
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
    stateUf:
      raw.stateUf != null && String(raw.stateUf).trim() !== ""
        ? String(raw.stateUf).trim().toUpperCase().slice(0, 2)
        : null,
    neighborhood: raw.neighborhood != null ? String(raw.neighborhood) : null,
    addressLine: raw.addressLine != null ? String(raw.addressLine) : null,
    addressNumber: raw.addressNumber != null ? String(raw.addressNumber) : null,
    zipcode: raw.zipcode != null ? String(raw.zipcode) : null,
    phone: raw.phone != null ? String(raw.phone) : null,
    whatsappPhone: raw.whatsappPhone != null ? String(raw.whatsappPhone) : null,
    websiteUrl: raw.websiteUrl != null ? String(raw.websiteUrl) : null,
    instagramUrl: raw.instagramUrl != null ? String(raw.instagramUrl) : null,
    facebookUrl: raw.facebookUrl != null ? String(raw.facebookUrl) : null,
    addedByCommunity: raw.addedByCommunity === true,
    isClaimed: raw.isClaimed === true,
    isVerified: raw.isVerified === true,
    viewerIsOwner: parseTruthyFlag(raw, "viewerIsOwner", "viewer_is_owner"),
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
