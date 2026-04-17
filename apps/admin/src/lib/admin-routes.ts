/** Rotas que exigem sessão admin (middleware + AuthGuard). */
export const ADMIN_PROTECTED_PATHS = new Set([
  "/dashboard",
  "/clinics",
  "/professionals",
  "/specialties",
  "/insurances",
  "/reviews",
  "/clinic-suggestions",
  "/profile-claims"
]);

export const ADMIN_PUBLIC_PATHS = new Set(["/", "/login"]);
