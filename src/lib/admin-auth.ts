// ─── Temporary client-side admin auth ───────────────────────────────────────
// Hardcoded credentials until real server-side admin auth is restored.

export const ADMIN_EMAIL = "oluffy995@gmail.com";
export const ADMIN_PASSWORD = "Saurav@69";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_VALUE = "1";

export const CLIENT_ADMIN_USER = {
  id: "client-admin",
  name: "Admin",
  email: ADMIN_EMAIL,
  role: "super_admin" as const,
};

export function validateAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export function setAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${ADMIN_SESSION_VALUE}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
  try {
    localStorage.setItem(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE);
  } catch {
    // private mode / blocked storage
  }
}

export function clearAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0`;
  try {
    localStorage.removeItem(ADMIN_SESSION_COOKIE);
  } catch {
    // ignore
  }
}

export function hasAdminSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${ADMIN_SESSION_COOKIE}=${ADMIN_SESSION_VALUE}`));
}
