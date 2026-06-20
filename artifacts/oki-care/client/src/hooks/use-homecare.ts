import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Service, type InsertService, type CarouselImage, type InsertCarouselImage, type Inquiry, type InsertInquiry, type SiteSettings, DEFAULT_SETTINGS } from "@shared/schema";

// ── helpers ──────────────────────────────────────────────────────────────────
function getToken(): string {
  return sessionStorage.getItem("admin_token") ?? "";
}

function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Public reads ──────────────────────────────────────────────────────────────
export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return DEFAULT_SETTINGS;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(api.services.list.path);
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
  });
}

export function useInquiries() {
  return useQuery<Inquiry[]>({
    queryKey: [api.inquiries.list.path],
    queryFn: async () => {
      const res = await fetch(api.inquiries.list.path);
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return res.json();
    },
  });
}

export function useCarouselImages() {
  return useQuery<CarouselImage[]>({
    queryKey: [api.carousel.list.path],
    queryFn: async () => {
      const res = await fetch(api.carousel.list.path);
      if (!res.ok) throw new Error("Failed to fetch carousel images");
      return res.json();
    },
  });
}

// ── Public write ──────────────────────────────────────────────────────────────
export function useCreateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inquiry: InsertInquiry) => {
      const res = await fetch(api.inquiries.create.path, {
        method: api.inquiries.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
      if (!res.ok) throw new Error("Failed to create inquiry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.inquiries.list.path] });
    },
  });
}

// ── Admin writes (require token) ──────────────────────────────────────────────
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<SiteSettings>) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      return res.json() as Promise<SiteSettings>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/settings"] }),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service: InsertService) => {
      const res = await fetch(api.services.create.path, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(service),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.services.delete.path, { id }), {
        method: api.services.delete.method,
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertService> }) => {
      const res = await fetch(buildUrl(api.services.update.path, { id }), {
        method: api.services.update.method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update service");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useCreateCarouselImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (image: InsertCarouselImage) => {
      const res = await fetch(api.carousel.create.path, {
        method: api.carousel.create.method,
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(image),
      });
      if (!res.ok) throw new Error("Failed to create carousel image");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.carousel.list.path] }),
  });
}

export function useDeleteCarouselImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.carousel.delete.path, { id }), {
        method: api.carousel.delete.method,
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to delete carousel image");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.carousel.list.path] }),
  });
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.inquiries.delete.path, { id }), {
        method: api.inquiries.delete.method,
        headers: authHeader(),
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.inquiries.list.path] }),
  });
}
