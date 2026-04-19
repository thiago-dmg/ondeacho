/** Rotas que exigem sessão admin (middleware + AuthGuard). */
export const ADMIN_PROTECTED_PATHS = new Set([
  "/dashboard",
  "/clinics",
  "/professionals",
  "/specialties",
  "/insurances",
  "/reviews",
  "/clinic-suggestions",
  "/profile-claims",
  "/users",
  "/profile"
]);

export const ADMIN_PUBLIC_PATHS = new Set(["/", "/login", "/esqueci-senha", "/redefinir-senha"]);
