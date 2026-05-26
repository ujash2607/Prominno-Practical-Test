import { decodeJwtPayload } from "./jwt";

const TOKEN_KEY = "pms_token";

export type AuthUser = { id: number; email?: string; role: "admin" | "seller" };

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(): AuthUser | null {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  const id = payload?.id;
  const role = payload?.role;
  if (typeof id !== "number") return null;
  if (role !== "admin" && role !== "seller") return null;
  const email = typeof payload?.email === "string" ? payload.email : undefined;
  return { id, email, role };
}

