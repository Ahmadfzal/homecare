import { createContext, useContext } from "react";

export const AdminTokenContext = createContext<string>("");

export function useAdminToken() {
  return useContext(AdminTokenContext);
}

export function getAdminHeaders(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
