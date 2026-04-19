export type CatalogOption = { id: string; name: string };

export type ClinicProfessionalSummary = { id: string; name: string };

export type ClinicListing = {
  id: string;
  name: string;
  city: string;
  neighborhood?: string | null;
  addressLine?: string | null;
  addressNumber?: string | null;
  zipcode?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  addedByCommunity: boolean;
  isClaimed: boolean;
  isVerified: boolean;
  viewerIsOwner?: boolean;
  rating: number;
  displayRating?: number | null;
  displayReviewCount: number;
  description?: string | null;
  professionals: ClinicProfessionalSummary[];
};

export type ReviewSummary = {
  averageRating: number | null;
  reviewCount: number;
};

export type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type FavoriteRow = {
  id: string;
  clinicId: string;
  clinic: ClinicListing;
};
