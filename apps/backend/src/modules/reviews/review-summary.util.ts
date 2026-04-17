export type AppRatingInput = {
  appSumRatings: number;
  appReviewCount: number;
};

export type AppRatingResult = {
  averageRating: number | null;
  reviewCount: number;
};

/** Média apenas de avaliações aprovadas no app (sem fontes externas). */
export function computeAppRating(input: AppRatingInput): AppRatingResult {
  const { appSumRatings, appReviewCount } = input;
  if (appReviewCount === 0) {
    return { averageRating: null, reviewCount: 0 };
  }
  return {
    averageRating: appSumRatings / appReviewCount,
    reviewCount: appReviewCount
  };
}
