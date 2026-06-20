console.log("ROUTES FILE LOADED");
import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { services, inquiries } from "../shared/schema";
import type { Server } from "http";
import { storage } from "./storage";
import {
  insertServiceSchema,
  insertCarouselImageSchema,
  insertInquirySchema,
} from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { testimg } from "../shared/schema";
import { upload, uploadsDir } from "./upload";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// In-memory admin tokens: token -> expiry timestamp
const adminTokens = new Map<string, number>();
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function createToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  adminTokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function isValidToken(token: string): boolean {
  const expiry = adminTokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

// Middleware: require valid admin token
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token || !isValidToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  // --- Public config ---
  app.get("/api/config", (_req, res) => {
    res.json({
      adminPath: process.env.ADMIN_PATH || "/admin",
    });
  });

  // --- Admin login ---
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD || "okiAdmin2025";
    if (!password || password !== adminPassword) {
      return res.status(401).json({ message: "Sandi salah" });
    }
    const token = createToken();
    res.json({ token });
  });

  // --- Admin logout ---
  app.post("/api/admin/logout", (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "").trim();
    if (token) adminTokens.delete(token);
    res.json({ success: true });
  });

  // --- Admin token check ---
  app.get("/api/admin/check", (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "").trim();
    res.json({ valid: !!token && isValidToken(token) });
  });

  // --- Public GET routes ---
  app.get(api.services.list.path, async (_req, res) => {
    const data = await storage.getServices();
    res.json(data);
  });

  app.get(api.carousel.list.path, async (_req, res) => {
    const images = await storage.getCarouselImages();
    res.json(images);
  });

  app.get(api.inquiries.list.path, async (_req, res) => {
    const data = await storage.getInquiries();
    res.json(data);
  });

  app.get("/api/testimg", async (_req, res) => {
    try {
      const data = await db.select().from(testimg);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal mengambil data slider" });
    }
  });

  // --- Public: submit inquiry ---
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const data = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(data);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", field: error.errors[0].path.join(".") });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // === Admin-protected write routes ===

  app.post(api.services.create.path, requireAdmin, async (req, res) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", field: error.errors[0].path.join(".") });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.services.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).end();
  });

  app.patch(api.services.update.path, requireAdmin, async (req, res) => {
    try {
      const data = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(Number(req.params.id), data);
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put("/api/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid ID" });
      const { title, description, price, category, notes } = req.body;
      const result = await db
        .update(services)
        .set({ title, description, price, category, notes })
        .where(eq(services.id, id))
        .returning();
      res.json({ success: true, updated: result });
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.post(api.carousel.create.path, requireAdmin, async (req, res) => {
    try {
      const data = insertCarouselImageSchema.parse(req.body);
      const image = await storage.createCarouselImage(data);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", field: error.errors[0].path.join(".") });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.carousel.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteCarouselImage(Number(req.params.id));
    res.status(204).end();
  });

  app.delete(api.inquiries.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteInquiry(Number(req.params.id));
    res.status(204).end();
  });

  // --- Settings (public read, admin write) ---
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put("/api/settings", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      console.error("Settings update error:", err);
      res.status(500).json({ error: "Gagal menyimpan pengaturan" });
    }
  });

  // --- Generic file upload: saves to disk, returns URL (no DB insert) ---
  app.post("/api/upload", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ message: "File wajib diunggah" });
      res.json({ imageUrl: `/uploads/${file.filename}` });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload gagal" });
    }
  });

  // --- Upload foto (disk storage, no Supabase) ---
  app.post("/upload-image", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      const { title, description } = req.body;

      if (!file || !title) {
        return res.status(400).json({ message: "Title dan image wajib" });
      }

      const imageUrl = `/uploads/${file.filename}`;

      const result = await db
        .insert(testimg)
        .values({ title, imageUrl, description: description || "" })
        .returning();

      res.json(result[0]);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload gagal" });
    }
  });

  // --- Hapus foto ---
  app.delete("/api/testimg/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

      const data = await db.select().from(testimg).where(eq(testimg.id, id));
      if (data.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" });

      // Delete file from disk
      const imageUrl = data[0].imageUrl;
      if (imageUrl?.startsWith("/uploads/")) {
        const filename = imageUrl.replace("/uploads/", "");
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await db.delete(testimg).where(eq(testimg.id, id));
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal hapus data" });
    }
  });

  return httpServer;
}
